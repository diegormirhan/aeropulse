from fastapi import APIRouter, HTTPException, status

from aeropulse_api.dependencies import RepositoryDep
from aeropulse_api.schemas import ModelReport

router = APIRouter(prefix="/api/model", tags=["model"])


@router.get("")
def read_model_report(repository: RepositoryDep) -> ModelReport:
    report = repository.get_model_report()
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model report is not available; run the training pipeline",
        )
    return report
