from app.models.base import Base
from app.models.user import User, UserRole
from app.models.project import Project
from app.models.task import Task, TaskStatus

# Expose models and Base to Alembic easily
__all__ = ["Base", "User", "UserRole", "Project", "Task", "TaskStatus"]
