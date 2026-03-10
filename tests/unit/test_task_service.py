import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
from app.services.task_service import TaskService
from app.models.task import Task, TaskStatus
from app.schemas.schemas import TaskUpdateStatus
from app.core.exceptions import ForbiddenError, EntityNotFoundError

@pytest.mark.asyncio
async def test_update_task_status_is_admin_success():
    # Setup
    db = AsyncMock()
    task_id = uuid4()
    user_id = uuid4()
    status_in = TaskUpdateStatus(status=TaskStatus.in_progress)
    
    # Mocking task_repo.get
    mock_task = Task(id=task_id, assigned_to=uuid4(), status=TaskStatus.todo)
    
    with patch("app.repositories.task.task_repo.get", AsyncMock(return_value=mock_task)) as mock_get, \
         patch("app.repositories.task.task_repo.update", AsyncMock(return_value=mock_task)) as mock_update:
        
        # Test
        result = await TaskService.update_task_status(db, task_id, status_in, user_id, is_admin=True)
        
        # Assertions
        assert result == mock_task
        mock_get.assert_called_once_with(db, id=task_id)
        mock_update.assert_called_once()
        # Check that it updated the status
        args, kwargs = mock_update.call_args
        assert kwargs["obj_in"] == {"status": TaskStatus.in_progress}

@pytest.mark.asyncio
async def test_update_task_status_developer_forbidden_if_not_assigned():
    # Setup
    db = AsyncMock()
    task_id = uuid4()
    current_user_id = uuid4() # The dev user
    other_user_id = uuid4()   # The user the task is assigned to
    status_in = TaskUpdateStatus(status=TaskStatus.completed)
    
    mock_task = Task(id=task_id, assigned_to=other_user_id, status=TaskStatus.in_progress)
    
    with patch("app.repositories.task.task_repo.get", AsyncMock(return_value=mock_task)):
        # Test & Assert
        with pytest.raises(ForbiddenError) as exc:
            await TaskService.update_task_status(db, task_id, status_in, current_user_id, is_admin=False)
        
        assert "Develops can only update status of tasks assigned to them" in str(exc.value)

@pytest.mark.asyncio
async def test_update_task_status_developer_success_if_assigned():
    # Setup
    db = AsyncMock()
    task_id = uuid4()
    current_user_id = uuid4()
    status_in = TaskUpdateStatus(status=TaskStatus.completed)
    
    # Mocking task_repo.get (assigned to the current user)
    mock_task = Task(id=task_id, assigned_to=current_user_id, status=TaskStatus.in_progress)
    
    with patch("app.repositories.task.task_repo.get", AsyncMock(return_value=mock_task)), \
         patch("app.repositories.task.task_repo.update", AsyncMock(return_value=mock_task)):
        
        # Test
        result = await TaskService.update_task_status(db, task_id, status_in, current_user_id, is_admin=False)
        
        # Assertions
        assert result == mock_task

@pytest.mark.asyncio
async def test_update_task_status_not_found():
    # Setup
    db = AsyncMock()
    task_id = uuid4()
    user_id = uuid4()
    status_in = TaskUpdateStatus(status=TaskStatus.completed)
    
    with patch("app.repositories.task.task_repo.get", AsyncMock(return_value=None)):
        # Test & Assert
        with pytest.raises(EntityNotFoundError):
            await TaskService.update_task_status(db, task_id, status_in, user_id, is_admin=True)
