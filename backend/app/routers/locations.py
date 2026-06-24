from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.location import LocationCreate, LocationResponse
from app.services.location_service import LocationService

router = APIRouter(prefix="/api/locations", tags=["locations"])


@router.get("", response_model=list[LocationResponse])
def get_locations(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return LocationService(db).get_all()


@router.post("", response_model=LocationResponse, status_code=201)
def create_location(
    data: LocationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return LocationService(db).create(data)


@router.put("/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: int,
    data: LocationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return LocationService(db).update(location_id, data)


@router.delete("/{location_id}", status_code=204)
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    LocationService(db).delete(location_id)
