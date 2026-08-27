import json
from pathlib import Path
from typing import Any

from pydantic import TypeAdapter

from aeropulse_api.schemas import EngineDetail, FleetResponse, ModelReport


class ArtifactRepository:
    def __init__(self, artifact_directory: Path) -> None:
        self._artifact_directory = artifact_directory

    @property
    def is_ready(self) -> bool:
        return all(
            path.exists()
            for path in (
                self._artifact_directory / "fleet.json",
                self._artifact_directory / "model_report.json",
                self._artifact_directory / "engines",
            )
        )

    def get_fleet(self) -> FleetResponse | None:
        payload = self._read_json(self._artifact_directory / "fleet.json")
        return FleetResponse.model_validate(payload) if payload is not None else None

    def get_engine(self, engine_id: int) -> EngineDetail | None:
        payload = self._read_json(self._artifact_directory / "engines" / f"{engine_id}.json")
        return EngineDetail.model_validate(payload) if payload is not None else None

    def get_model_report(self) -> ModelReport | None:
        payload = self._read_json(self._artifact_directory / "model_report.json")
        return ModelReport.model_validate(payload) if payload is not None else None

    @staticmethod
    def _read_json(path: Path) -> dict[str, Any] | None:
        if not path.exists():
            return None
        return TypeAdapter(dict[str, Any]).validate_python(
            json.loads(path.read_text(encoding="utf-8"))
        )
