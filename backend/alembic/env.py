import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# alembic.ini の logging 設定を読み込む
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 環境変数からDATABASE_URLを取得してalembic設定に注入
database_url = os.environ.get("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

# モデルのメタデータをインポート（オートジェネレート用）
from app.models.base import Base  # noqa: E402
from app.models.user import User  # noqa: E402, F401
from app.models.category import Category  # noqa: E402, F401
from app.models.book import Book  # noqa: E402, F401
from app.models.loan_record import LoanRecord  # noqa: E402, F401
from app.models.location import Location  # noqa: E402, F401

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
