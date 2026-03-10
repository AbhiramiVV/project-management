from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.repositories.base import BaseRepository
from app.models.project import Project
from app.schemas.schemas import ProjectCreate, ProjectUpdate


class ProjectRepository(BaseRepository[Project, ProjectCreate, ProjectUpdate]):
    async def get_multi_filtered(
        self, db: AsyncSession, *, q: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        query = select(Project)
        if q:
            query = query.filter(Project.name.ilike(f"%{q}%"))
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def count_filtered(self, db: AsyncSession, *, q: Optional[str] = None) -> int:
        query = select(func.count()).select_from(Project)
        if q:
            query = query.filter(Project.name.ilike(f"%{q}%"))
        result = await db.execute(query)
        return result.scalar() or 0

project_repo = ProjectRepository(Project)
