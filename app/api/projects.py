from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.db.database import get_db
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectRead
from app.services.project_service import ProjectService
from app.api.dependencies import get_current_admin_user, get_current_user
from app.models.user import User

router = APIRouter()

@router.post("", response_model=ProjectRead, status_code=201)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> ProjectRead:
    return await ProjectService.create_project(db, project_in, current_user.id)

@router.get("", response_model=List[ProjectRead])
async def read_projects(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[ProjectRead]:
    return await ProjectService.get_projects(db, skip=skip, limit=limit)

@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: UUID,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> ProjectRead:
    return await ProjectService.update_project(db, project_id, project_in)

@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    await ProjectService.delete_project(db, project_id)
