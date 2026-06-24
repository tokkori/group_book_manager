from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse


class CategoryService:
    def __init__(self, db: Session):
        self.repo = CategoryRepository(db)

    def get_all(self) -> list[CategoryResponse]:
        categories = self.repo.get_all()
        return [CategoryResponse.model_validate(c) for c in categories]

    def create(self, data: CategoryCreate) -> CategoryResponse:
        if self.repo.get_by_name(data.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このカテゴリ名は既に存在します",
            )
        category = self.repo.create(name=data.name, description=data.description)
        return CategoryResponse.model_validate(category)

    def update(self, category_id: int, data: CategoryUpdate) -> CategoryResponse:
        category = self.repo.get_by_id(category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="カテゴリが見つかりません")

        if data.name and data.name != category.name:
            existing = self.repo.get_by_name(data.name)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="このカテゴリ名は既に存在します",
                )
        updated = self.repo.update(category, name=data.name, description=data.description)
        return CategoryResponse.model_validate(updated)

    def delete(self, category_id: int) -> None:
        category = self.repo.get_by_id(category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="カテゴリが見つかりません")
        if self.repo.count_books(category_id) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このカテゴリには書籍が登録されています。先に書籍のカテゴリを変更してください",
            )
        self.repo.delete(category)
