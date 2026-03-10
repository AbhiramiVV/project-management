from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
from app.repositories.task import task_repo
from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole
from app.schemas.schemas import TaskCreate, TaskUpdateStatus, TaskAssign
from app.core.exceptions import EntityNotFoundError, ForbiddenError
from app.services.project_service import ProjectService
from app.repositories.user import user_repo

class TaskService:
    @staticmethod
    async def create_task(db: AsyncSession, task_in: TaskCreate) -> Task:
        # Check if project exists
        await ProjectService.get_project(db, task_in.project_id)
        
        # Check if assigned user exists
        if task_in.assigned_to:
            user = await user_repo.get(db, task_in.assigned_to)
            if not user:
                raise EntityNotFoundError(detail="Assigned user not found")
                
        return await task_repo.create(db, obj_in=task_in)

    @staticmethod
    async def get_tasks(
        db: AsyncSession, 
        current_user: User,
        project_id: Optional[UUID] = None, 
        assigned_to: Optional[UUID] = None, 
        status: Optional[TaskStatus] = None,
        q: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> dict:
        # If user is a developer, they can only see tasks assigned to them
        if current_user.role == UserRole.developer:
            assigned_to = current_user.id
            
        tasks = await task_repo.get_filtered(
            db, project_id=project_id, assigned_to=assigned_to, status=status, q=q, skip=skip, limit=limit
        )
        total = await task_repo.count_filtered(
            db, project_id=project_id, assigned_to=assigned_to, status=status, q=q
        )
        
        return {
            "items": tasks,
            "total": total,
            "page": (skip // limit) + 1,
            "size": limit
        }

    @staticmethod
    async def get_task(db: AsyncSession, task_id: UUID) -> Task:
        task = await task_repo.get(db, id=task_id)
        if not task:
            raise EntityNotFoundError(detail="Task not found")
        return task

    @staticmethod
    async def assign_task(db: AsyncSession, task_id: UUID, assign_in: TaskAssign) -> Task:
        task = await TaskService.get_task(db, task_id)
        user = await user_repo.get(db, assign_in.assigned_to)
        if not user:
            raise EntityNotFoundError(detail="User to assign not found")
            
        return await task_repo.update(db, db_obj=task, obj_in={"assigned_to": assign_in.assigned_to})

    @staticmethod
    async def update_task_status(db: AsyncSession, task_id: UUID, status_in: TaskUpdateStatus, current_user_id: UUID, is_admin: bool) -> Task:
        task = await TaskService.get_task(db, task_id)
        
        # Developers can only update tasks assigned to them
        if not is_admin and task.assigned_to != current_user_id:
            raise ForbiddenError(detail="Develops can only update status of tasks assigned to them")
            
        return await task_repo.update(db, db_obj=task, obj_in={"status": status_in.status})
