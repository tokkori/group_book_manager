from pydantic import BaseModel, field_validator


class CategoryCreate(BaseModel):
    name: str
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("カテゴリ名は必須です")
        if len(v) > 100:
            raise ValueError("カテゴリ名は100文字以内で入力してください")
        return v


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("カテゴリ名は必須です")
            if len(v) > 100:
                raise ValueError("カテゴリ名は100文字以内で入力してください")
        return v


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None

    model_config = {"from_attributes": True}
