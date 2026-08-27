from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from numpy.typing import NDArray
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor

from aeropulse_api.domain import calculate_health_score, classify_risk
from aeropulse_api.ml.data import (
    SENSOR_METADATA,
    find_informative_sensors,
    read_rul_targets,
    read_trajectories,
)
from aeropulse_api.ml.features import FeatureBuilder
from aeropulse_api.ml.metrics import RegressionMetrics, regression_metrics


@dataclass(frozen=True)
class TrainingConfig:
    dataset: str = "FD001"
    rul_cap: int = 125
    validation_engine_count: int = 20
    interval_confidence: float = 0.90
    random_seed: int = 42


@dataclass(frozen=True)
class TrainedCandidate:
    name: str
    role: str
    model: Any
    validation_predictions: NDArray[np.float64]
    validation_metrics: RegressionMetrics


def train_project(project_root: Path, config: TrainingConfig | None = None) -> dict[str, Any]:
    active_config = config or TrainingConfig()
    raw_directory = project_root / "data" / "raw"
    artifact_directory = project_root / "artifacts"

    train_frame = read_trajectories(raw_directory / f"train_{active_config.dataset}.txt")
    test_frame = read_trajectories(raw_directory / f"test_{active_config.dataset}.txt")
    test_targets = read_rul_targets(raw_directory / f"RUL_{active_config.dataset}.txt")

    sensor_columns = find_informative_sensors(train_frame)
    feature_builder = FeatureBuilder(sensor_columns=sensor_columns)
    labeled_train = feature_builder.add_training_target(train_frame, cap=active_config.rul_cap)
    training_features = feature_builder.transform(labeled_train)
    feature_columns = training_features.columns.tolist()

    train_mask, validation_mask = _engine_holdout_masks(
        labeled_train, active_config.validation_engine_count
    )
    x_train = training_features.loc[train_mask, feature_columns]
    y_train = labeled_train.loc[train_mask, "rul"].to_numpy(dtype=float)
    x_validation = training_features.loc[validation_mask, feature_columns]
    y_validation = labeled_train.loc[validation_mask, "rul"].to_numpy(dtype=float)

    candidates = _train_candidates(
        x_train,
        y_train,
        x_validation,
        y_validation,
        random_seed=active_config.random_seed,
    )
    selected = min(candidates, key=lambda candidate: candidate.validation_metrics.rmse)
    interval_radius = float(
        np.quantile(
            np.abs(y_validation - selected.validation_predictions),
            active_config.interval_confidence,
            method="higher",
        )
    )

    test_features = feature_builder.transform(test_frame)[feature_columns]
    trajectory_predictions = _bounded_predictions(selected.model, test_features)
    latest_rows = test_frame.groupby("engine_id", sort=True).tail(1)
    latest_indices = latest_rows.index
    latest_predictions = trajectory_predictions[latest_indices]
    actual_rul = latest_rows["engine_id"].map(test_targets).to_numpy(dtype=float)
    test_metrics = regression_metrics(actual_rul, latest_predictions)
    interval_coverage = _interval_coverage(actual_rul, latest_predictions, interval_radius)

    feature_importance = _global_feature_importance(selected.model, feature_columns)
    displayed_sensors = _select_display_sensors(feature_importance, sensor_columns, count=6)

    generated_at = datetime.now(UTC).isoformat()
    artifact_directory.mkdir(parents=True, exist_ok=True)
    (artifact_directory / "engines").mkdir(parents=True, exist_ok=True)

    fleet_payload, engine_payloads = _build_product_payloads(
        generated_at=generated_at,
        dataset=active_config.dataset,
        test_frame=test_frame,
        test_targets=test_targets,
        trajectory_predictions=trajectory_predictions,
        interval_radius=interval_radius,
        interval_coverage=interval_coverage,
        test_metrics=test_metrics,
        feature_matrix=test_features,
        model=selected.model,
        feature_columns=feature_columns,
        displayed_sensors=displayed_sensors,
        training_frame=train_frame,
    )
    model_report = _build_model_report(
        generated_at=generated_at,
        config=active_config,
        selected=selected,
        candidates=candidates,
        test_metrics=test_metrics,
        interval_radius=interval_radius,
        interval_coverage=interval_coverage,
        feature_importance=feature_importance,
        training_rows=len(x_train),
        validation_rows=len(x_validation),
        test_engines=len(latest_rows),
    )

    _write_json(artifact_directory / "fleet.json", fleet_payload)
    _write_json(artifact_directory / "model_report.json", model_report)
    for engine_id, payload in engine_payloads.items():
        _write_json(artifact_directory / "engines" / f"{engine_id}.json", payload)

    joblib.dump(
        {
            "model": selected.model,
            "model_name": selected.name,
            "feature_builder": feature_builder,
            "feature_columns": feature_columns,
            "interval_radius": interval_radius,
            "dataset": active_config.dataset,
        },
        artifact_directory / "model.joblib",
        compress=3,
    )
    return model_report


def _engine_holdout_masks(
    frame: pd.DataFrame, validation_engine_count: int
) -> tuple[pd.Series, pd.Series]:
    engine_ids = sorted(frame["engine_id"].unique())
    validation_ids = set(engine_ids[-validation_engine_count:])
    validation_mask = frame["engine_id"].isin(validation_ids)
    return ~validation_mask, validation_mask


def _train_candidates(
    x_train: pd.DataFrame,
    y_train: NDArray[np.float64],
    x_validation: pd.DataFrame,
    y_validation: NDArray[np.float64],
    random_seed: int,
) -> list[TrainedCandidate]:
    baseline = Pipeline(
        [
            ("scale", StandardScaler()),
            ("regressor", Ridge(alpha=10.0)),
        ]
    )
    candidate = XGBRegressor(
        objective="reg:squarederror",
        n_estimators=450,
        max_depth=5,
        learning_rate=0.035,
        min_child_weight=5,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_alpha=0.05,
        reg_lambda=1.5,
        random_state=random_seed,
        n_jobs=-1,
    )

    trained_candidates: list[TrainedCandidate] = []
    for name, role, model in (
        ("Ridge baseline", "baseline", baseline),
        ("XGBoost window model", "candidate", candidate),
    ):
        model.fit(x_train, y_train)
        predictions = _bounded_predictions(model, x_validation)
        trained_candidates.append(
            TrainedCandidate(
                name=name,
                role=role,
                model=model,
                validation_predictions=predictions,
                validation_metrics=regression_metrics(y_validation, predictions),
            )
        )
    return trained_candidates


def _bounded_predictions(model: Any, features: pd.DataFrame) -> NDArray[np.float64]:
    return np.clip(np.asarray(model.predict(features), dtype=float), 0.0, 125.0)


def _interval_coverage(
    targets: NDArray[np.float64], predictions: NDArray[np.float64], radius: float
) -> float:
    lower = np.maximum(0.0, predictions - radius)
    upper = np.minimum(125.0, predictions + radius)
    covered = (targets >= lower) & (targets <= upper)
    return round(float(np.mean(covered) * 100), 1)


def _global_feature_importance(model: Any, feature_columns: list[str]) -> list[dict[str, Any]]:
    if isinstance(model, XGBRegressor):
        raw_importance = model.feature_importances_
    else:
        regressor = model.named_steps["regressor"]
        raw_importance = np.abs(regressor.coef_)

    total = float(np.sum(raw_importance)) or 1.0
    records = [
        {
            "feature": feature,
            "label": _humanize_feature(feature),
            "importance": round(float(importance / total * 100), 2),
        }
        for feature, importance in zip(feature_columns, raw_importance, strict=True)
    ]
    return sorted(records, key=lambda record: record["importance"], reverse=True)


def _select_display_sensors(
    feature_importance: list[dict[str, Any]], sensor_columns: list[str], count: int
) -> list[str]:
    sensor_importance = {sensor: 0.0 for sensor in sensor_columns}
    for record in feature_importance:
        for sensor in sensor_columns:
            if record["feature"] == sensor or record["feature"].startswith(f"{sensor}_"):
                sensor_importance[sensor] += record["importance"]
                break
    ranked = sorted(sensor_importance, key=lambda sensor: sensor_importance[sensor], reverse=True)
    return ranked[:count]


def _build_product_payloads(
    *,
    generated_at: str,
    dataset: str,
    test_frame: pd.DataFrame,
    test_targets: pd.Series,
    trajectory_predictions: NDArray[np.float64],
    interval_radius: float,
    interval_coverage: float,
    test_metrics: RegressionMetrics,
    feature_matrix: pd.DataFrame,
    model: Any,
    feature_columns: list[str],
    displayed_sensors: list[str],
    training_frame: pd.DataFrame,
) -> tuple[dict[str, Any], dict[int, dict[str, Any]]]:
    latest_rows = test_frame.groupby("engine_id", sort=True).tail(1)
    fleet_engines: list[dict[str, Any]] = []
    engine_payloads: dict[int, dict[str, Any]] = {}
    sensor_ranges = _sensor_ranges(training_frame, displayed_sensors)

    for raw_latest_index, latest_row in latest_rows.iterrows():
        latest_index = cast(int, raw_latest_index)
        engine_id = int(latest_row["engine_id"])
        predicted_rul = float(trajectory_predictions[latest_index])
        actual_rul = float(test_targets.loc[engine_id])
        summary = {
            "engine_id": engine_id,
            "observed_cycles": int(latest_row["cycle"]),
            "predicted_rul": round(predicted_rul, 1),
            "lower_rul": round(max(0.0, predicted_rul - interval_radius), 1),
            "upper_rul": round(min(125.0, predicted_rul + interval_radius), 1),
            "actual_rul": round(actual_rul, 1),
            "absolute_error": round(abs(predicted_rul - actual_rul), 1),
            "health_score": calculate_health_score(predicted_rul),
            "risk_band": classify_risk(predicted_rul).value,
        }
        fleet_engines.append(summary)

        engine_mask = test_frame["engine_id"] == engine_id
        engine_rows = test_frame.loc[engine_mask]
        engine_indices = engine_rows.index.to_numpy()
        engine_predictions = trajectory_predictions[engine_indices]
        prediction_series = [
            {
                "cycle": int(cycle),
                "predicted_rul": round(float(prediction), 1),
                "lower_rul": round(max(0.0, float(prediction) - interval_radius), 1),
                "upper_rul": round(min(125.0, float(prediction) + interval_radius), 1),
            }
            for cycle, prediction in zip(engine_rows["cycle"], engine_predictions, strict=True)
        ]
        sensors = _build_sensor_series(engine_rows, displayed_sensors, sensor_ranges)
        contributions = _local_contributions(
            model,
            feature_matrix.loc[[latest_index]],
            feature_columns,
            limit=6,
        )
        engine_payloads[engine_id] = {
            "engine": summary,
            "prediction_series": prediction_series,
            "sensors": sensors,
            "contributions": contributions,
        }

    fleet_engines.sort(key=lambda engine: (engine["predicted_rul"], engine["engine_id"]))
    risk_counts = {
        band: sum(engine["risk_band"] == band for engine in fleet_engines)
        for band in ("critical", "watch", "stable")
    }
    fleet_payload = {
        "dataset": dataset,
        "generated_at": generated_at,
        "summary": {
            "total_engines": len(fleet_engines),
            "critical_engines": risk_counts["critical"],
            "watch_engines": risk_counts["watch"],
            "stable_engines": risk_counts["stable"],
            "median_predicted_rul": round(
                float(np.median([engine["predicted_rul"] for engine in fleet_engines])), 1
            ),
            "test_mae": test_metrics.mae,
            "interval_coverage": interval_coverage,
        },
        "engines": fleet_engines,
    }
    return fleet_payload, engine_payloads


def _sensor_ranges(
    training_frame: pd.DataFrame, sensor_columns: list[str]
) -> dict[str, tuple[float, float]]:
    return {
        sensor: (
            float(training_frame[sensor].quantile(0.01)),
            float(training_frame[sensor].quantile(0.99)),
        )
        for sensor in sensor_columns
    }


def _build_sensor_series(
    frame: pd.DataFrame,
    sensor_columns: list[str],
    sensor_ranges: dict[str, tuple[float, float]],
) -> list[dict[str, Any]]:
    series: list[dict[str, Any]] = []
    for sensor in sensor_columns:
        minimum, maximum = sensor_ranges[sensor]
        scale = maximum - minimum or 1.0
        label, unit = SENSOR_METADATA[sensor]
        points = [
            {
                "cycle": int(cycle),
                "value": round(float(value), 4),
                "normalized": round(
                    float(np.clip((float(value) - minimum) / scale * 100, 0, 100)), 2
                ),
            }
            for cycle, value in zip(frame["cycle"], frame[sensor], strict=True)
        ]
        series.append({"key": sensor, "label": label, "unit": unit, "points": points})
    return series


def _local_contributions(
    model: Any,
    row: pd.DataFrame,
    feature_columns: list[str],
    limit: int,
) -> list[dict[str, Any]]:
    if isinstance(model, XGBRegressor):
        matrix = xgb.DMatrix(row, feature_names=feature_columns)
        values = model.get_booster().predict(matrix, pred_contribs=True)[0][:-1]
    else:
        scaled = model.named_steps["scale"].transform(row)[0]
        values = scaled * model.named_steps["regressor"].coef_

    ranked_indices = np.argsort(np.abs(values))[::-1][:limit]
    return [
        {
            "feature": feature_columns[index],
            "label": _humanize_feature(feature_columns[index]),
            "contribution": round(float(values[index]), 2),
            "direction": "extends" if values[index] >= 0 else "reduces",
        }
        for index in ranked_indices
    ]


def _humanize_feature(feature: str) -> str:
    if feature == "cycle":
        return "Observed operating cycle"
    if feature.startswith("setting_"):
        return f"Operational setting {feature.rsplit('_', maxsplit=1)[-1]}"

    for sensor, (label, _) in SENSOR_METADATA.items():
        if feature == sensor:
            return label
        if feature.startswith(f"{sensor}_"):
            suffix = feature.removeprefix(f"{sensor}_")
            operation, _, window = suffix.rpartition("_")
            operation_label = {
                "mean": "mean",
                "std": "variability",
                "trend": "trend",
                "delta": "change",
            }.get(operation, operation)
            if window:
                return f"{window}-cycle {operation_label} · {label}"
    return feature.replace("_", " ").title()


def _build_model_report(
    *,
    generated_at: str,
    config: TrainingConfig,
    selected: TrainedCandidate,
    candidates: list[TrainedCandidate],
    test_metrics: RegressionMetrics,
    interval_radius: float,
    interval_coverage: float,
    feature_importance: list[dict[str, Any]],
    training_rows: int,
    validation_rows: int,
    test_engines: int,
) -> dict[str, Any]:
    comparisons = []
    for candidate in candidates:
        comparisons.append(
            {
                "name": candidate.name,
                "role": candidate.role,
                "validation": candidate.validation_metrics.to_dict(),
                "test": test_metrics.to_dict() if candidate.name == selected.name else None,
            }
        )

    return {
        "dataset": config.dataset,
        "generated_at": generated_at,
        "selected_model": selected.name,
        "target": f"Remaining useful life capped at {config.rul_cap} cycles",
        "training_rows": training_rows,
        "validation_rows": validation_rows,
        "test_engines": test_engines,
        "interval_radius": round(interval_radius, 1),
        "interval_coverage": interval_coverage,
        "comparisons": comparisons,
        "feature_importance": feature_importance[:12],
        "limitations": [
            "C-MAPSS is a high-fidelity simulation, not live commercial aircraft telemetry.",
            "The conformal interval uses a fixed residual radius from the engine holdout set.",
            "The application is an educational portfolio system and is not safety-certified.",
        ],
    }


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
