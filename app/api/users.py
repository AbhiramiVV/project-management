from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.schemas.schemas import UserCreate, UserRead
from app.services.user_service import UserService
from app.api.dependencies import get_current_admin_user
from app.models.user import User

router = APIRouter()

@router.post("", response_model=UserRead, status_code=201)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> User:
    return await UserService.create_user(db, user_in)

@router.get("", response_model=List[UserRead])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> List[User]:
    return await UserService.get_users(db, skip=skip, limit=limit)
