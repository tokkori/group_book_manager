from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserCreate, TokenResponse, UserResponse


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def login(self, username: str, password: str) -> TokenResponse:
        user = self.repo.get_by_username(username)
        # ユーザー不存在とパスワード不一致を同一メッセージにして列挙攻撃を防ぐ
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="ユーザー名またはパスワードが正しくありません",
            )
        token = create_access_token({"sub": str(user.id), "username": user.username})
        return TokenResponse(access_token=token)

    def create_user(self, data: UserCreate) -> UserResponse:
        existing = self.repo.get_by_username(data.username)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このユーザー名は既に使用されています",
            )
        hashed = hash_password(data.password)
        user = self.repo.create(
            username=data.username,
            display_name=data.display_name,
            hashed_password=hashed,
        )
        return UserResponse.model_validate(user)
