"""add locations table and books.location_id

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-25
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # locations テーブル作成
    op.create_table(
        "locations",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False, unique=True),
    )

    # books に location_id カラム追加
    op.add_column("books", sa.Column("location_id", sa.Integer, sa.ForeignKey("locations.id", ondelete="SET NULL"), nullable=True))

    # 既存の location テキストデータを locations テーブルに移行
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT DISTINCT location FROM books WHERE location IS NOT NULL AND location != ''"))
    for row in result:
        loc_name = row[0]
        conn.execute(sa.text("INSERT INTO locations (name) VALUES (:name)"), {"name": loc_name})

    # books.location_id を既存データから紐付け
    conn.execute(sa.text("""
        UPDATE books SET location_id = (
            SELECT l.id FROM locations l WHERE l.name = books.location
        ) WHERE location IS NOT NULL AND location != ''
    """))


def downgrade() -> None:
    op.drop_column("books", "location_id")
    op.drop_table("locations")
