from datetime import datetime
from pydantic import BaseModel, field_validator
from app.schemas.category import CategoryResponse
from app.schemas.location import LocationResponse


class BookCreate(BaseModel):
    title: str
    author: str | None = None
    isbn: str | None = None
    publisher: str | None = None
    published_year: int | None = None
    category_id: int | None = None
    location_id: int | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("タイトルは必須です")
        if len(v) > 500:
            raise ValueError("タイトルは500文字以内で入力してください")
        return v

    @field_validator("published_year")
    @classmethod
    def validate_published_year(cls, v: int | None) -> int | None:
        if v is not None:
            from datetime import date
            current_year = date.today().year
            if v < 1000 or v > current_year:
                raise ValueError(f"出版年は1000〜{current_year}の範囲で入力してください")
        return v


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    isbn: str | None = None
    publisher: str | None = None
    published_year: int | None = None
    category_id: int | None = None
    location_id: int | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("タイトルは必須です")
            if len(v) > 500:
                raise ValueError("タイトルは500文字以内で入力してください")
        return v


class BookResponse(BaseModel):
    id: int
    title: str
    author: str | None
    isbn: str | None
    publisher: str | None
    published_year: int | None
    category: CategoryResponse | None
    location: LocationResponse | None
    is_borrowed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookListResponse(BaseModel):
    items: list[BookResponse]
    total: int
    page: int
    size: int


class LoanSummary(BaseModel):
    id: int
    borrower_name: str
    loan_date: str

    model_config = {"from_attributes": True}


class BookDetailResponse(BookResponse):
    current_loan: LoanSummary | None
    loan_history: list["LoanHistoryItem"]


class LoanHistoryItem(BaseModel):
    id: int
    borrower_name: str
    loan_date: str
    return_date: str | None

    model_config = {"from_attributes": True}


class BookCreateResponse(BookResponse):
    isbn_duplicate: bool = False
