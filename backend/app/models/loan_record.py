from datetime import date
from sqlalchemy import ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class LoanRecord(Base):
    __tablename__ = "loan_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    loan_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    return_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    book: Mapped["Book"] = relationship("Book", back_populates="loan_records")  # noqa: F821
    user: Mapped["User"] = relationship("User", back_populates="loan_records")  # noqa: F821
