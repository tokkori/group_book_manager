from sqlalchemy.orm import Session
from app.models.location import Location


class LocationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Location]:
        return self.db.query(Location).order_by(Location.name).all()

    def get_by_id(self, location_id: int) -> Location | None:
        return self.db.query(Location).filter(Location.id == location_id).first()

    def get_by_name(self, name: str) -> Location | None:
        return self.db.query(Location).filter(Location.name == name).first()

    def create(self, name: str) -> Location:
        loc = Location(name=name)
        self.db.add(loc)
        self.db.commit()
        self.db.refresh(loc)
        return loc

    def update(self, loc: Location, name: str) -> Location:
        loc.name = name
        self.db.commit()
        self.db.refresh(loc)
        return loc

    def delete(self, loc: Location) -> None:
        self.db.delete(loc)
        self.db.commit()

    def count_books(self, location_id: int) -> int:
        from app.models.book import Book
        return self.db.query(Book).filter(Book.location_id == location_id).count()
