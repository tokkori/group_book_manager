from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from app.models.book import Book
from app.models.loan_record import LoanRecord


class BookRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_list(
        self,
        keyword: str | None = None,
        category_id: int | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Book], int]:
        query = self.db.query(Book).options(joinedload(Book.category), joinedload(Book.location_rel))

        if keyword:
            kw = f"%{keyword}%"
            query = query.filter(
                or_(
                    Book.title.ilike(kw),
                    Book.author.ilike(kw),
                    Book.isbn.ilike(kw),
                )
            )
        if category_id is not None:
            query = query.filter(Book.category_id == category_id)

        total = query.count()
        books = query.order_by(Book.created_at.desc()).offset(skip).limit(limit).all()
        return books, total

    def get_by_id(self, book_id: int) -> Book | None:
        return (
            self.db.query(Book)
            .options(joinedload(Book.category), joinedload(Book.location_rel))
            .filter(Book.id == book_id)
            .first()
        )

    def get_by_isbn(self, isbn: str) -> Book | None:
        return self.db.query(Book).filter(Book.isbn == isbn).first()

    def count_by_category(self, category_id: int) -> int:
        return self.db.query(func.count(Book.id)).filter(Book.category_id == category_id).scalar() or 0

    def create(self, data: dict) -> Book:
        book = Book(**data)
        self.db.add(book)
        self.db.commit()
        self.db.refresh(book)
        return book

    def update(self, book: Book, data: dict) -> Book:
        for key, value in data.items():
            setattr(book, key, value)
        self.db.commit()
        self.db.refresh(book)
        return book

    def delete(self, book: Book) -> None:
        self.db.delete(book)
        self.db.commit()

    def is_borrowed(self, book_id: int) -> bool:
        return (
            self.db.query(LoanRecord)
            .filter(LoanRecord.book_id == book_id, LoanRecord.return_date.is_(None))
            .first()
        ) is not None
