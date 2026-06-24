from pydantic import BaseModel, field_validator


class LocationCreate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("保管場所名は必須です")
        if len(v) > 200:
            raise ValueError("保管場所名は200文字以内で入力してください")
        return v


class LocationResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
