from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.database import get_db
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectRead, ProjectPaginated
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

@router.get("", response_model=ProjectPaginated)
async def read_projects(
    q: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    return await ProjectService.get_projects(db, q=q, skip=skip, limit=limit)

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
