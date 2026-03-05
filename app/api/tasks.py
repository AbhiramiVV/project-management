from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
from app.db.database import get_db
from app.schemas.schemas import TaskCreate, TaskUpdateStatus, TaskAssign, TaskRead
from app.services.task_service import TaskService
from app.api.dependencies import get_current_admin_user, get_current_user
from app.models.user import User, UserRole
from app.models.task import TaskStatus

router = APIRouter()

@router.post("", response_model=TaskRead, status_code=201)
async def create_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> TaskRead:
    return await TaskService.create_task(db, task_in)

@router.get("", response_model=List[TaskRead])
async def read_tasks(
    project_id: Optional[UUID] = Query(None),
    status: Optional[TaskStatus] = Query(None),
    assigned_to: Optional[UUID] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[TaskRead]:
    # If developer, optionally we could restrict them from viewing all tasks but
    # requirement says "Can view tasks assigned to them". Actually, let's enforce it.
    if current_user.role != UserRole.admin:
        # Override assigned_to to their own ID so they can't see other people's tasks
        assigned_to = current_user.id
        
    return await TaskService.get_tasks(
        db, project_id=project_id, assigned_to=assigned_to, status=status, skip=skip, limit=limit
    )

@router.put("/{task_id}/assign", response_model=TaskRead)
async def assign_task(
    task_id: UUID,
    assign_in: TaskAssign,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> TaskRead:
    return await TaskService.assign_task(db, task_id, assign_in)

@router.put("/{task_id}/status", response_model=TaskRead)
async def update_task_status(
    task_id: UUID,
    status_in: TaskUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> TaskRead:
    is_admin = current_user.role == UserRole.admin
    return await TaskService.update_task_status(db, task_id, status_in, current_user.id, is_admin)
