from datetime import datetime
from pydantic import BaseModel, field_validator
import re


class UserCreate(BaseModel):
    username: str
    display_name: str
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not 3 <= len(v) <= 50:
            raise ValueError("ユーザー名は3〜50文字で入力してください")
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("ユーザー名は英数字・アンダースコア・ハイフンのみ使用できます")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("パスワードは8文字以上で設定してください")
        return v

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("表示名は必須です")
        return v.strip()


class UserResponse(BaseModel):
    id: int
    username: str
    display_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str
