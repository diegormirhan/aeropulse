from dataclasses import dataclass

import pandas as pd

from aeropulse_api.ml.data import SETTING_COLUMNS


@dataclass(frozen=True)
class FeatureBuilder:
    sensor_columns: list[str]
    windows: tuple[int, ...] = (5, 20)

    def transform(self, frame: pd.DataFrame) -> pd.DataFrame:
        ordered = frame.sort_values(["engine_id", "cycle"]).copy()
        engine_groups = ordered.groupby("engine_id", sort=False)

        feature_columns = ["cycle"]
        feature_columns.extend(column for column in SETTING_COLUMNS if column in ordered)
        feature_columns.extend(self.sensor_columns)
        features = ordered[feature_columns].copy()

        for sensor in self.sensor_columns:
            sensor_group = engine_groups[sensor]
            features[f"{sensor}_delta_1"] = sensor_group.diff().fillna(0.0)

            for window in self.windows:
                rolling = sensor_group.rolling(window=window, min_periods=1)
                features[f"{sensor}_mean_{window}"] = rolling.mean().reset_index(level=0, drop=True)
                features[f"{sensor}_std_{window}"] = (
                    rolling.std(ddof=0).reset_index(level=0, drop=True).fillna(0.0)
                )
                features[f"{sensor}_trend_{window}"] = (
                    sensor_group.diff(periods=window).fillna(0.0) / window
                )

        return features.sort_index()

    @staticmethod
    def add_training_target(frame: pd.DataFrame, cap: int = 125) -> pd.DataFrame:
        labeled = frame.copy()
        final_cycles = labeled.groupby("engine_id")["cycle"].transform("max")
        labeled["rul"] = (final_cycles - labeled["cycle"]).clip(upper=cap).astype(float)
        return labeled
