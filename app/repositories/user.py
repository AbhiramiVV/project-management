from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.user import User
from app.schemas.schemas import UserCreate, UserBase
from sqlalchemy import func, or_


class UserRepository(BaseRepository[User, UserCreate, UserBase]):

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        try:
            result = await db.execute(select(User).filter(User.email == email))
            return result.scalars().first()
        except Exception as e:
            print(f"Error fetching user by email: {e}")
            return None

    async def get_multi_filtered(
        self, db: AsyncSession, *, q: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List[User]:
        query = select(User)
        if q:
            query = query.filter(or_(User.name.ilike(f"%{q}%"), User.email.ilike(f"%{q}%")))
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def count_filtered(self, db: AsyncSession, *, q: Optional[str] = None) -> int:
        result = await db.execute(select(func.count()).select_from(User).filter(or_(User.name.ilike(f"%{q}%"), User.email.ilike(f"%{q}%")) if q else True))
        return result.scalar() or 0


user_repo = UserRepository(User)