from dataclasses import asdict, dataclass

import numpy as np
from numpy.typing import NDArray
from sklearn.metrics import mean_absolute_error, mean_squared_error


@dataclass(frozen=True)
class RegressionMetrics:
    rmse: float
    mae: float
    nasa_score: float

    def to_dict(self) -> dict[str, float]:
        return asdict(self)


def nasa_score(targets: NDArray[np.floating], predictions: NDArray[np.floating]) -> float:
    errors = predictions - targets
    penalties = np.where(
        errors < 0,
        np.exp(-errors / 13.0) - 1.0,
        np.exp(errors / 10.0) - 1.0,
    )
    return float(np.sum(penalties))


def regression_metrics(
    targets: NDArray[np.floating], predictions: NDArray[np.floating]
) -> RegressionMetrics:
    return RegressionMetrics(
        rmse=round(float(mean_squared_error(targets, predictions) ** 0.5), 3),
        mae=round(float(mean_absolute_error(targets, predictions)), 3),
        nasa_score=round(nasa_score(targets, predictions), 3),
    )
