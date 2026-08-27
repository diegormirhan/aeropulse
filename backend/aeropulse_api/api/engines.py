from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, status

from aeropulse_api.dependencies import RepositoryDep
from aeropulse_api.schemas import EngineDetail

router = APIRouter(prefix="/api/engines", tags=["engines"])


@router.get("/{engine_id}")
def read_engine(engine_id: Annotated[int, Path(ge=1)], repository: RepositoryDep) -> EngineDetail:
    engine = repository.get_engine(engine_id)
    if engine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engine {engine_id} was not found",
        )
    return engine
