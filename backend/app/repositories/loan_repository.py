from datetime import date
from sqlalchemy.orm import Session, joinedload
from app.models.loan_record import LoanRecord


class LoanRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_loans(self) -> list[LoanRecord]:
        return (
            self.db.query(LoanRecord)
            .options(joinedload(LoanRecord.book), joinedload(LoanRecord.user))
            .filter(LoanRecord.return_date.is_(None))
            .order_by(LoanRecord.loan_date.desc())
            .all()
        )

    def get_active_loan_for_book(self, book_id: int) -> LoanRecord | None:
        return (
            self.db.query(LoanRecord)
            .options(joinedload(LoanRecord.user))
            .filter(LoanRecord.book_id == book_id, LoanRecord.return_date.is_(None))
            .first()
        )

    def get_history_for_book(self, book_id: int) -> list[LoanRecord]:
        return (
            self.db.query(LoanRecord)
            .options(joinedload(LoanRecord.user))
            .filter(LoanRecord.book_id == book_id)
            .order_by(LoanRecord.loan_date.desc())
            .all()
        )

    def get_by_id(self, loan_id: int) -> LoanRecord | None:
        return self.db.query(LoanRecord).filter(LoanRecord.id == loan_id).first()

    def create(self, book_id: int, user_id: int) -> LoanRecord:
        loan = LoanRecord(book_id=book_id, user_id=user_id, loan_date=date.today())
        self.db.add(loan)
        self.db.commit()
        self.db.refresh(loan)
        return loan

    def return_book(self, loan: LoanRecord) -> LoanRecord:
        loan.return_date = date.today()
        self.db.commit()
        self.db.refresh(loan)
        return loan
