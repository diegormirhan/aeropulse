from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from aeropulse_api.api import engines, fleet, health, model
from aeropulse_api.repository import ArtifactRepository

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def create_app(artifact_directory: Path | None = None) -> FastAPI:
    app = FastAPI(
        title="AeroPulse API",
        summary="Local remaining-useful-life intelligence for NASA C-MAPSS",
        version="0.1.0",
    )
    app.state.repository = ArtifactRepository(artifact_directory or PROJECT_ROOT / "artifacts")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["*"],
    )
    app.include_router(health.router)
    app.include_router(fleet.router)
    app.include_router(engines.router)
    app.include_router(model.router)

    frontend_directory = PROJECT_ROOT / "frontend" / "dist"
    if frontend_directory.exists():
        app.frontend("/", directory=frontend_directory)

    return app


app = create_app()
