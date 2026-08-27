from pathlib import Path

from aeropulse_api.main import create_app
from fastapi.testclient import TestClient


def test_health_endpoint_reports_missing_artifacts(tmp_path: Path) -> None:
    app = create_app(artifact_directory=tmp_path)

    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "degraded",
        "dataset": "FD001",
        "artifacts_ready": False,
    }


def test_unknown_engine_returns_not_found(tmp_path: Path) -> None:
    app = create_app(artifact_directory=tmp_path)

    with TestClient(app) as client:
        response = client.get("/api/engines/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Engine 999 was not found"
