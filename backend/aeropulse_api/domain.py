from enum import StrEnum

MAX_DISPLAY_RUL = 125.0


class RiskBand(StrEnum):
    CRITICAL = "critical"
    WATCH = "watch"
    STABLE = "stable"


def classify_risk(predicted_rul: float) -> RiskBand:
    if predicted_rul <= 15:
        return RiskBand.CRITICAL
    if predicted_rul <= 40:
        return RiskBand.WATCH
    return RiskBand.STABLE


def calculate_health_score(predicted_rul: float) -> int:
    normalized_score = predicted_rul / MAX_DISPLAY_RUL * 100
    return round(min(100, max(0, normalized_score)))
