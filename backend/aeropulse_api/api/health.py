from fastapi import APIRouter

from aeropulse_api.dependencies import RepositoryDep
from aeropulse_api.schemas import HealthResponse

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("")
def read_health(repository: RepositoryDep) -> HealthResponse:
    artifacts_ready = repository.is_ready
    return HealthResponse(
        status="ok" if artifacts_ready else "degraded",
        dataset="FD001",
        artifacts_ready=artifacts_ready,
    )
