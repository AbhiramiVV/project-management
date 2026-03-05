from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.user import User
from app.schemas.schemas import UserCreate, UserBase


class UserRepository(BaseRepository[User, UserCreate, UserBase]):

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        try:
            result = await db.execute(select(User).filter(User.email == email))
            print(result,"result from user repo")
            return result.scalars().first()
        except Exception as e:
            print(f"Error fetching user by email: {e}")
            return None


user_repo = UserRepository(User)