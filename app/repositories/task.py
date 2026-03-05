from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.task import Task, TaskStatus
from app.schemas.schemas import TaskCreate, TaskBase
from uuid import UUID

class TaskRepository(BaseRepository[Task, TaskCreate, TaskBase]):
    async def get_filtered(
        self, db: AsyncSession, *, 
        project_id: Optional[UUID] = None, 
        assigned_to: Optional[UUID] = None, 
        status: Optional[TaskStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        query = select(Task)
        if project_id:
            query = query.filter(Task.project_id == project_id)
        if assigned_to:
            query = query.filter(Task.assigned_to == assigned_to)
        if status:
            query = query.filter(Task.status == status)
            
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

task_repo = TaskRepository(Task)
