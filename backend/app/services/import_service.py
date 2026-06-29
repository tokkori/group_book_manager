import csv
import io
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from app.repositories.book_repository import BookRepository
from app.repositories.category_repository import CategoryRepository
from app.schemas.loan import ImportResult


class ImportService:
    def __init__(self, db: Session):
        self.book_repo = BookRepository(db)
        self.cat_repo = CategoryRepository(db)

    async def import_books(self, file: UploadFile) -> ImportResult:
        filename = file.filename or ""
        if not (filename.endswith(".csv") or filename.endswith(".xlsx") or filename.endswith(".xls")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV または Excel ファイルをアップロードしてください",
            )

        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="ファイルサイズは10MB以下にしてください",
            )

        rows = self._parse_file(filename, content)
        return self._process_rows(rows)

    def _parse_file(self, filename: str, content: bytes) -> list[dict]:
        if filename.endswith(".csv"):
            text = content.decode("utf-8-sig")  # BOM対応
            reader = csv.DictReader(io.StringIO(text))
            return [row for row in reader]
        else:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            ws = wb.active
            rows = list(ws.iter_rows(values_only=True))
            if not rows:
                return []
            headers = [str(h).strip() if h else "" for h in rows[0]]
            result = []
            for row in rows[1:]:
                result.append({headers[i]: (str(v).strip() if v is not None else "") for i, v in enumerate(row)})
            return result

    def _process_rows(self, rows: list[dict]) -> ImportResult:
        success = 0
        skipped = 0
        errors: list[str] = []

        # ヘッダー名の正規化マッピング（日本語・英語両対応）
        header_map = {
            "title": ["title", "タイトル", "書名"],
            "author": ["author", "著者"],
            "isbn": ["isbn", "ISBN"],
            "publisher": ["publisher", "出版社"],
            "published_year": ["published_year", "出版年"],
            "location": ["location", "場所", "保管場所"],
            "category": ["category", "カテゴリ"],
        }

        for line_no, row in enumerate(rows, start=2):
            try:
                normalized = self._normalize_row(row, header_map)
                title = normalized.get("title", "").strip()

                if not title:
                    skipped += 1
                    continue

                isbn = normalized.get("isbn", "").strip() or None
                if isbn and self.book_repo.get_by_isbn(isbn):
                    skipped += 1
                    continue

                category_id = None
                cat_name = normalized.get("category", "").strip()
                if cat_name:
                    cat = self.cat_repo.get_by_name(cat_name)
                    if not cat:
                        cat = self.cat_repo.create(name=cat_name, description=None)
                    category_id = cat.id

                published_year = None
                year_str = normalized.get("published_year", "").strip()
                if year_str:
                    try:
                        published_year = int(year_str)
                    except ValueError:
                        pass

                self.book_repo.create({
                    "title": title,
                    "author": normalized.get("author", "").strip() or None,
                    "isbn": isbn,
                    "publisher": normalized.get("publisher", "").strip() or None,
                    "published_year": published_year,
                    "location": normalized.get("location", "").strip() or None,
                    "category_id": category_id,
                })
                success += 1

            except Exception as e:
                # 1行の失敗でセッションが壊れ、以降の行（カテゴリ登録含む）が
                # 連鎖的に失敗するのを防ぐためロールバックして復旧する
                self.book_repo.db.rollback()
                errors.append(f"{line_no}行目: {str(e)}")

        return ImportResult(success=success, skipped=skipped, errors=errors)

    def _normalize_row(self, row: dict, header_map: dict) -> dict:
        result = {}
        lower_row = {k.lower().strip(): v for k, v in row.items()}
        for field, candidates in header_map.items():
            for candidate in candidates:
                if candidate.lower() in lower_row:
                    result[field] = lower_row[candidate.lower()] or ""
                    break
            else:
                result[field] = ""
        return result
