from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.location_repository import LocationRepository
from app.schemas.location import LocationCreate, LocationResponse


class LocationService:
    def __init__(self, db: Session):
        self.repo = LocationRepository(db)

    def get_all(self) -> list[LocationResponse]:
        locations = self.repo.get_all()
        return [LocationResponse.model_validate(loc) for loc in locations]

    def create(self, data: LocationCreate) -> LocationResponse:
        if self.repo.get_by_name(data.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="この保管場所名は既に存在します",
            )
        loc = self.repo.create(name=data.name)
        return LocationResponse.model_validate(loc)

    def update(self, location_id: int, data: LocationCreate) -> LocationResponse:
        loc = self.repo.get_by_id(location_id)
        if not loc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="保管場所が見つかりません")
        if data.name != loc.name and self.repo.get_by_name(data.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="この保管場所名は既に存在します",
            )
        updated = self.repo.update(loc, name=data.name)
        return LocationResponse.model_validate(updated)

    def delete(self, location_id: int) -> None:
        loc = self.repo.get_by_id(location_id)
        if not loc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="保管場所が見つかりません")
        if self.repo.count_books(location_id) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="この保管場所には書籍が登録されています。先に書籍の保管場所を変更してください",
            )
        self.repo.delete(loc)
