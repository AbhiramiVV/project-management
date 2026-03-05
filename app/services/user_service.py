from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.repositories.user import user_repo
from app.models.user import User
from app.schemas.schemas import UserCreate
from app.core.security import get_password_hash
from app.core.exceptions import DuplicateResourceError

class UserService:
    @staticmethod
    async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
        user = await user_repo.get_by_email(db, email=user_in.email)
        if user:
            raise DuplicateResourceError(detail="The user with this username already exists in the system.")
        
        user_data = user_in.model_dump()
        user_data["password_hash"] = get_password_hash(user_data.pop("password"))
        
        return await user_repo.create(db, obj_in=user_data)

    @staticmethod
    async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
        return await user_repo.get_multi(db, skip=skip, limit=limit)
