from typing import Annotated

from fastapi import Depends, Request

from aeropulse_api.repository import ArtifactRepository


def get_repository(request: Request) -> ArtifactRepository:
    return request.app.state.repository


RepositoryDep = Annotated[ArtifactRepository, Depends(get_repository)]
