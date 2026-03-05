from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from app.db.database import get_db
from app.schemas.schemas import Token, LoginRequest
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Token:
    login_req = LoginRequest(email=form_data.username, password=form_data.password)
    return await AuthService.authenticate(db, login_req)
