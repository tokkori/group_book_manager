from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.loan import LoanResponse, BorrowRequest
from app.services.loan_service import LoanService

router = APIRouter(prefix="/api/loans", tags=["loans"])


@router.get("", response_model=list[LoanResponse])
def get_active_loans(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return LoanService(db).get_active_loans()


@router.post("", response_model=LoanResponse, status_code=201)
def borrow_book(
    data: BorrowRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LoanService(db).borrow_book(book_id=data.book_id, user_id=current_user.id)


@router.put("/{loan_id}/return", response_model=LoanResponse)
def return_book(
    loan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return LoanService(db).return_book(loan_id)


@router.get("/history/{book_id}", response_model=list[LoanResponse])
def get_loan_history(
    book_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return LoanService(db).get_loan_history(book_id)
