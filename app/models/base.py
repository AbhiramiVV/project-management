from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID

Base = declarative_base()

class TimestampMixin:
    """Mixin for models that need created_at and updated_at."""
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class UUIDMixin:
    """Mixin for models that use UUID as primary key."""
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
