from fastapi import APIRouter, HTTPException, status

from aeropulse_api.dependencies import RepositoryDep
from aeropulse_api.schemas import FleetResponse

router = APIRouter(prefix="/api/fleet", tags=["fleet"])


@router.get("")
def read_fleet(repository: RepositoryDep) -> FleetResponse:
    fleet = repository.get_fleet()
    if fleet is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifacts are not available; run the training pipeline",
        )
    return fleet
