from sqlalchemy import Column, String, Enum
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base, TimestampMixin, UUIDMixin

class UserRole(enum.Enum):
    admin = "admin"
    developer = "developer"

class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.developer, nullable=False)

    projects = relationship("Project", back_populates="creator", cascade="all, delete")
    tasks = relationship("Task", back_populates="assignee")
