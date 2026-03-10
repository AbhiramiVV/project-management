from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.schemas import UserCreate, UserRead, UserPaginated
from app.services.user_service import UserService
from app.api.dependencies import get_current_admin_user, get_current_user
from app.models.user import User

router = APIRouter()

@router.post("", response_model=UserRead, status_code=201)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> User:
    return await UserService.create_user(db, user_in)

@router.get("/me", response_model=UserRead)
async def get_me(
    current_user: User = Depends(get_current_user)
) -> User:
    return current_user

@router.get("", response_model=UserPaginated)
async def read_users(
    q: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    return await UserService.get_users(db, q=q, skip=skip, limit=limit)
