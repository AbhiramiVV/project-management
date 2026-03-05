from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import ALGORITHM
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.db.database import get_db
from app.models.user import User, UserRole
from app.repositories.user import user_repo
from uuid import UUID

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise UnauthorizedError(detail="Token is invalid")
    except JWTError:
        raise UnauthorizedError(detail="Token could not be validated")
        
    user = await user_repo.get(db, id=UUID(user_id))
    if user is None:
        raise UnauthorizedError(detail="User not found")
    return user

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise ForbiddenError(detail="The user doesn't have enough privileges")
    return current_user
