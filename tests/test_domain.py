from aeropulse_api.domain import RiskBand, calculate_health_score, classify_risk


def test_classify_risk_uses_operational_thresholds() -> None:
    assert classify_risk(14.9) is RiskBand.CRITICAL
    assert classify_risk(15.0) is RiskBand.CRITICAL
    assert classify_risk(15.1) is RiskBand.WATCH
    assert classify_risk(40.0) is RiskBand.WATCH
    assert classify_risk(40.1) is RiskBand.STABLE


def test_health_score_is_clamped_to_a_percentage() -> None:
    assert calculate_health_score(-4.0) == 0
    assert calculate_health_score(62.5) == 50
    assert calculate_health_score(180.0) == 100
