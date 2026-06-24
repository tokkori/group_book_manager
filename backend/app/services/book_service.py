from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.book_repository import BookRepository
from app.repositories.loan_repository import LoanRepository
from app.schemas.book import (
    BookCreate, BookUpdate, BookResponse, BookListResponse,
    BookDetailResponse, BookCreateResponse, LoanSummary, LoanHistoryItem,
)


def _to_response(book, repo: BookRepository) -> BookResponse:
    is_borrowed = repo.is_borrowed(book.id)
    return BookResponse(
        id=book.id,
        title=book.title,
        author=book.author,
        isbn=book.isbn,
        publisher=book.publisher,
        published_year=book.published_year,
        category=book.category,
        location=book.location_rel,
        is_borrowed=is_borrowed,
        created_at=book.created_at,
        updated_at=book.updated_at,
    )


class BookService:
    def __init__(self, db: Session):
        self.repo = BookRepository(db)
        self.loan_repo = LoanRepository(db)

    def get_books(
        self,
        keyword: str | None = None,
        category_id: int | None = None,
        page: int = 1,
        size: int = 20,
    ) -> BookListResponse:
        skip = (page - 1) * size
        books, total = self.repo.get_list(keyword=keyword, category_id=category_id, skip=skip, limit=size)
        items = [_to_response(b, self.repo) for b in books]
        return BookListResponse(items=items, total=total, page=page, size=size)

    def get_book(self, book_id: int) -> BookDetailResponse:
        book = self.repo.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="書籍が見つかりません")

        active_loan = self.loan_repo.get_active_loan_for_book(book_id)
        history = self.loan_repo.get_history_for_book(book_id)

        current_loan = None
        if active_loan:
            current_loan = LoanSummary(
                id=active_loan.id,
                borrower_name=active_loan.user.display_name,
                loan_date=str(active_loan.loan_date),
            )

        loan_history = [
            LoanHistoryItem(
                id=lr.id,
                borrower_name=lr.user.display_name,
                loan_date=str(lr.loan_date),
                return_date=str(lr.return_date) if lr.return_date else None,
            )
            for lr in history
        ]

        base = _to_response(book, self.repo)
        return BookDetailResponse(
            **base.model_dump(),
            current_loan=current_loan,
            loan_history=loan_history,
        )

    def create_book(self, data: BookCreate) -> BookCreateResponse:
        isbn_duplicate = False
        if data.isbn:
            isbn_duplicate = self.repo.get_by_isbn(data.isbn) is not None

        book_data = data.model_dump()
        book = self.repo.create(book_data)

        base = _to_response(book, self.repo)
        return BookCreateResponse(**base.model_dump(), isbn_duplicate=isbn_duplicate)

    def update_book(self, book_id: int, data: BookUpdate) -> BookResponse:
        book = self.repo.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="書籍が見つかりません")

        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        updated = self.repo.update(book, update_data)
        return _to_response(updated, self.repo)

    def delete_book(self, book_id: int) -> None:
        book = self.repo.get_by_id(book_id)
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="書籍が見つかりません")
        if self.repo.is_borrowed(book_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="貸出中の書籍は削除できません",
            )
        self.repo.delete(book)
