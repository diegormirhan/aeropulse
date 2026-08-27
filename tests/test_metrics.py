import numpy as np
from aeropulse_api.ml.metrics import nasa_score, regression_metrics


def test_nasa_score_penalizes_late_predictions_more_than_early_predictions() -> None:
    targets = np.array([50.0])

    early_score = nasa_score(targets, np.array([60.0]))
    late_score = nasa_score(targets, np.array([40.0]))

    assert early_score > late_score


def test_regression_metrics_returns_expected_values() -> None:
    metrics = regression_metrics(
        np.array([10.0, 20.0, 30.0]),
        np.array([12.0, 18.0, 30.0]),
    )

    assert metrics.rmse == 1.633
    assert metrics.mae == 1.333
