FROM python:3.12-slim

WORKDIR /app

# 非rootユーザー作成
RUN useradd -m appuser

# システム依存パッケージ（psycopg2・curl用）
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:appuser /app
USER appuser

# DBマイグレーション後にアプリ起動
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
