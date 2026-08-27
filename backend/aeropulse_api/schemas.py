from typing import Literal

from pydantic import BaseModel, Field

from aeropulse_api.domain import RiskBand


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    dataset: str
    artifacts_ready: bool


class FleetEngine(BaseModel):
    engine_id: int
    observed_cycles: int
    predicted_rul: float
    lower_rul: float
    upper_rul: float
    actual_rul: float
    absolute_error: float
    health_score: int = Field(ge=0, le=100)
    risk_band: RiskBand


class FleetSummary(BaseModel):
    total_engines: int
    critical_engines: int
    watch_engines: int
    stable_engines: int
    median_predicted_rul: float
    test_mae: float
    interval_coverage: float


class FleetResponse(BaseModel):
    dataset: str
    generated_at: str
    summary: FleetSummary
    engines: list[FleetEngine]


class PredictionPoint(BaseModel):
    cycle: int
    predicted_rul: float
    lower_rul: float
    upper_rul: float


class SensorPoint(BaseModel):
    cycle: int
    value: float
    normalized: float


class SensorSeries(BaseModel):
    key: str
    label: str
    unit: str
    points: list[SensorPoint]


class FeatureContribution(BaseModel):
    feature: str
    label: str
    contribution: float
    direction: Literal["extends", "reduces"]


class EngineDetail(BaseModel):
    engine: FleetEngine
    prediction_series: list[PredictionPoint]
    sensors: list[SensorSeries]
    contributions: list[FeatureContribution]


class MetricSet(BaseModel):
    rmse: float
    mae: float
    nasa_score: float


class ModelComparison(BaseModel):
    name: str
    role: str
    validation: MetricSet
    test: MetricSet | None = None


class FeatureImportance(BaseModel):
    feature: str
    label: str
    importance: float


class ModelReport(BaseModel):
    dataset: str
    generated_at: str
    selected_model: str
    target: str
    training_rows: int
    validation_rows: int
    test_engines: int
    interval_radius: float
    interval_coverage: float
    comparisons: list[ModelComparison]
    feature_importance: list[FeatureImportance]
    limitations: list[str]
