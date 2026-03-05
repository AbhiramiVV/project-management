from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.repositories.project import project_repo
from app.models.project import Project
from app.schemas.schemas import ProjectCreate, ProjectUpdate
from app.core.exceptions import EntityNotFoundError

class ProjectService:
    @staticmethod
    async def create_project(db: AsyncSession, project_in: ProjectCreate, creator_id: UUID) -> Project:
        project_data = project_in.model_dump()
        project_data["created_by"] = creator_id
        return await project_repo.create(db, obj_in=project_data)

    @staticmethod
    async def get_projects(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Project]:
        return await project_repo.get_multi(db, skip=skip, limit=limit)

    @staticmethod
    async def get_project(db: AsyncSession, project_id: UUID) -> Project:
        project = await project_repo.get(db, id=project_id)
        if not project:
            raise EntityNotFoundError(detail="Project not found")
        return project

    @staticmethod
    async def update_project(db: AsyncSession, project_id: UUID, project_in: ProjectUpdate) -> Project:
        db_project = await ProjectService.get_project(db, project_id)
        return await project_repo.update(db, db_obj=db_project, obj_in=project_in)

    @staticmethod
    async def delete_project(db: AsyncSession, project_id: UUID) -> Project:
        await ProjectService.get_project(db, project_id)
        return await project_repo.delete(db, id=project_id)
