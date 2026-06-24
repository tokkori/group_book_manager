from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.loan_repository import LoanRepository
from app.repositories.book_repository import BookRepository
from app.schemas.loan import LoanResponse


def _to_loan_response(loan) -> LoanResponse:
    return LoanResponse(
        id=loan.id,
        book_id=loan.book_id,
        book_title=loan.book.title,
        user_id=loan.user_id,
        borrower_name=loan.user.display_name,
        loan_date=loan.loan_date,
        return_date=loan.return_date,
    )


class LoanService:
    def __init__(self, db: Session):
        self.repo = LoanRepository(db)
        self.book_repo = BookRepository(db)

    def get_active_loans(self) -> list[LoanResponse]:
        loans = self.repo.get_active_loans()
        return [_to_loan_response(l) for l in loans]

    def borrow_book(self, book_id: int, user_id: int) -> LoanResponse:
        book = self.book_repo.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="書籍が見つかりません")

        active = self.repo.get_active_loan_for_book(book_id)
        if active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="この書籍は現在貸出中です",
            )
        loan = self.repo.create(book_id=book_id, user_id=user_id)
        # joinedloadされていないため再取得
        loan = self.repo.get_by_id(loan.id)
        from sqlalchemy.orm import joinedload
        from app.models.loan_record import LoanRecord
        db = self.repo.db
        loan = (
            db.query(LoanRecord)
            .options(joinedload(LoanRecord.book), joinedload(LoanRecord.user))
            .filter(LoanRecord.id == loan.id)
            .first()
        )
        return _to_loan_response(loan)

    def return_book(self, loan_id: int) -> LoanResponse:
        loan = self.repo.get_by_id(loan_id)
        if not loan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="貸出記録が見つかりません")
        if loan.return_date is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="既に返却済みです",
            )
        updated = self.repo.return_book(loan)
        from sqlalchemy.orm import joinedload
        from app.models.loan_record import LoanRecord
        db = self.repo.db
        updated = (
            db.query(LoanRecord)
            .options(joinedload(LoanRecord.book), joinedload(LoanRecord.user))
            .filter(LoanRecord.id == updated.id)
            .first()
        )
        return _to_loan_response(updated)

    def get_loan_history(self, book_id: int) -> list[LoanResponse]:
        book = self.book_repo.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="書籍が見つかりません")
        loans = self.repo.get_history_for_book(book_id)
        return [_to_loan_response(l) for l in loans]
