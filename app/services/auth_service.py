from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.schemas import Token, LoginRequest
from app.repositories.user import user_repo
from app.core.security import verify_password, create_access_token
from app.core.exceptions import UnauthorizedError

class AuthService:
    @staticmethod
    async def authenticate(db: AsyncSession, login_req: LoginRequest) -> Token:
        user = await user_repo.get_by_email(db, email=login_req.email)
        if not user or not verify_password(login_req.password, user.password_hash):
            raise UnauthorizedError(detail="Incorrect email or password")
            
        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token)
