# Deployment Architecture — book-manager

## ディレクトリ構成（コード生成後）

```
book-manager/                    # ワークスペースルート
├── docker-compose.yml
├── .env                         # 環境変数（gitignore対象）
├── .env.example                 # 環境変数テンプレート（git管理）
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   └── security.py
│       ├── models/
│       │   ├── user.py
│       │   ├── book.py
│       │   ├── category.py
│       │   └── loan_record.py
│       ├── schemas/
│       │   ├── auth.py
│       │   ├── book.py
│       │   ├── category.py
│       │   └── loan.py
│       ├── routers/
│       │   ├── auth.py
│       │   ├── books.py
│       │   ├── categories.py
│       │   ├── loans.py
│       │   └── import_data.py
│       ├── services/
│       │   ├── auth_service.py
│       │   ├── book_service.py
│       │   ├── category_service.py
│       │   ├── loan_service.py
│       │   └── import_service.py
│       ├── repositories/
│       │   ├── user_repository.py
│       │   ├── book_repository.py
│       │   ├── category_repository.py
│       │   └── loan_repository.py
│       └── alembic/
│           ├── alembic.ini
│           ├── env.py
│           └── versions/
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── pages/
        ├── components/
        └── services/
```

---

## docker-compose.yml 設計

```yaml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - book-manager-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: ${ALGORITHM:-HS256}
      ACCESS_TOKEN_EXPIRE_MINUTES: ${ACCESS_TOKEN_EXPIRE_MINUTES:-480}
      # プロキシ設定（.envに値がある場合のみ有効、空の場合はコンテナに渡らない）
      HTTP_PROXY: ${HTTP_PROXY:-}
      HTTPS_PROXY: ${HTTPS_PROXY:-}
      NO_PROXY: ${NO_PROXY:-localhost,127.0.0.1,db}
      # 小文字も設定（Pythonライブラリは小文字を優先する場合がある）
      http_proxy: ${HTTP_PROXY:-}
      https_proxy: ${HTTPS_PROXY:-}
      no_proxy: ${NO_PROXY:-localhost,127.0.0.1,db}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - book-manager-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      # ビルド時のプロキシ（npm install など）
      args:
        HTTP_PROXY: ${HTTP_PROXY:-}
        HTTPS_PROXY: ${HTTPS_PROXY:-}
        NO_PROXY: ${NO_PROXY:-localhost,127.0.0.1}
    environment:
      # 実行時のプロキシ（Nginx 自体は外部通信しないため通常不要だが念のため設定）
      HTTP_PROXY: ${HTTP_PROXY:-}
      HTTPS_PROXY: ${HTTPS_PROXY:-}
      NO_PROXY: ${NO_PROXY:-localhost,127.0.0.1,backend}
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - book-manager-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  book-manager-network:
    driver: bridge
```

**プロキシ設定の補足:**
- `.env` で `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` が未設定（コメントアウト）の場合、`${VAR:-}` 記法により空文字が渡される。Docker はコンテナ内で空文字の環境変数は実質無視されるため、プロキシなし環境でも動作に影響しない
- `NO_PROXY` には必ずコンテナ間通信のホスト名（`db`、`backend`）を含めること。含めない場合、バックエンドがプロキシ経由でDBに接続しようとして失敗する
- Python の `httpx` / `requests` 等は大文字小文字両方を参照するため、両方設定している
- frontend の `build.args` はイメージビルド時（`npm ci` 等）のプロキシ設定。実行時とは分離されている

---

## Dockerfile 設計方針

### backend/Dockerfile（マルチステージ不使用 — シンプル構成）
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# 非rootユーザーで実行
RUN useradd -m appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:appuser /app
USER appuser

# DBマイグレーション実行後にアプリ起動
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

### frontend/Dockerfile（マルチステージビルド）
```dockerfile
# Stage 1: React ビルド
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Nginx で静的配信
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## .env.example

```env
# PostgreSQL
POSTGRES_DB=bookdb
POSTGRES_USER=bookuser
POSTGRES_PASSWORD=changeme_strong_password

# JWT
SECRET_KEY=changeme_generate_with_openssl_rand_hex_32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# プロキシ設定（プロキシ環境下の場合のみ設定。不要な場合はコメントアウトのまま）
# HTTP_PROXY=http://proxy.example.com:8080
# HTTPS_PROXY=http://proxy.example.com:8080
# NO_PROXY=localhost,127.0.0.1,db,backend
```

---

## 起動手順

```bash
# 1. リポジトリのルートディレクトリで実行
cd book-manager

# 2. 環境変数ファイルを作成
cp .env.example .env
# .env を編集して本番用パスワード・シークレットキーに変更

# 3. SECRET_KEY の生成（例）
# python -c "import secrets; print(secrets.token_hex(32))"

# 4. 起動
docker compose up -d

# 5. 状態確認
docker compose ps
docker compose logs -f backend

# 6. アクセス
# http://localhost:3000
```

---

## 運用コマンド

```bash
# 停止
docker compose down

# データも含めて完全削除
docker compose down -v

# ログ確認
docker compose logs backend
docker compose logs db

# バックエンドコンテナに入る
docker compose exec backend bash

# DBに接続
docker compose exec db psql -U bookuser -d bookdb

# マイグレーション手動実行
docker compose exec backend alembic upgrade head

# イメージ再ビルド（コード変更後）
docker compose up -d --build
```

---

## Alembic マイグレーション戦略

- `alembic upgrade head` はコンテナ起動時（CMD）に自動実行
- 新しいマイグレーションファイルは `backend/alembic/versions/` に配置
- 初回起動時に全テーブルが自動作成される
