import pandas as pd
from aeropulse_api.ml.features import FeatureBuilder


def test_feature_builder_never_rolls_across_engine_boundaries() -> None:
    frame = pd.DataFrame(
        {
            "engine_id": [1, 1, 2, 2],
            "cycle": [1, 2, 1, 2],
            "setting_1": [0.0, 0.0, 0.0, 0.0],
            "sensor_2": [1.0, 3.0, 100.0, 104.0],
        }
    )
    builder = FeatureBuilder(sensor_columns=["sensor_2"], windows=(2,))

    features = builder.transform(frame)

    assert features.loc[2, "sensor_2_mean_2"] == 100.0
    assert features.loc[3, "sensor_2_mean_2"] == 102.0


def test_feature_builder_adds_rul_for_training_trajectories() -> None:
    frame = pd.DataFrame(
        {
            "engine_id": [7, 7, 7],
            "cycle": [1, 2, 3],
            "setting_1": [0.0, 0.0, 0.0],
            "sensor_2": [1.0, 2.0, 3.0],
        }
    )

    labeled = FeatureBuilder.add_training_target(frame, cap=2)

    assert labeled["rul"].tolist() == [2.0, 1.0, 0.0]
