from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.book import BookCreate, BookUpdate, BookResponse, BookListResponse, BookDetailResponse, BookCreateResponse
from app.services.book_service import BookService

router = APIRouter(prefix="/api/books", tags=["books"])


@router.get("", response_model=BookListResponse)
def get_books(
    keyword: str | None = Query(None),
    category_id: int | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return BookService(db).get_books(keyword=keyword, category_id=category_id, page=page, size=size)


@router.post("", response_model=BookCreateResponse, status_code=201)
def create_book(
    data: BookCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return BookService(db).create_book(data)


@router.get("/{book_id}", response_model=BookDetailResponse)
def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return BookService(db).get_book(book_id)


@router.put("/{book_id}", response_model=BookResponse)
def update_book(
    book_id: int,
    data: BookUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return BookService(db).update_book(book_id, data)


@router.delete("/{book_id}", status_code=204)
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    BookService(db).delete_book(book_id)
