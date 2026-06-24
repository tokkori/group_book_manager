from datetime import date
from pydantic import BaseModel


class LoanResponse(BaseModel):
    id: int
    book_id: int
    book_title: str
    user_id: int
    borrower_name: str
    loan_date: date
    return_date: date | None

    model_config = {"from_attributes": True}


class BorrowRequest(BaseModel):
    book_id: int


class ImportResult(BaseModel):
    success: int
    skipped: int
    errors: list[str]
