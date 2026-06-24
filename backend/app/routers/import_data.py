from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.loan import ImportResult
from app.services.import_service import ImportService

router = APIRouter(prefix="/api/import", tags=["import"])


@router.post("/books", response_model=ImportResult)
async def import_books(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = ImportService(db)
    return await service.import_books(file)
