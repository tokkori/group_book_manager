# 書籍管理システム

部署等、小規模グループで簡易的に書籍を管理するWebアプリケーションです。  
Docker が使える環境であればどこでも利用可能です。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 + TypeScript + Vite + Tailwind CSS |
| バックエンド | Python 3.12 + FastAPI |
| データベース | PostgreSQL 16 |
| 認証 | JWT（python-jose）+ bcrypt（passlib） |
| コンテナ | Docker + Docker Compose |

---

## 起動手順

### 1. 環境変数ファイルの作成

```bash
cp .env.example .env
```

`.env` を開いて以下の値を設定してください：

```env
POSTGRES_PASSWORD=任意の強いパスワード
SECRET_KEY=ランダムな32バイトの16進数文字列
```

`SECRET_KEY` の生成方法：
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 2. 起動

```bash
docker compose up -d
```

### 3. アクセス

ブラウザで http://localhost:3000 を開いてください。

### 4. 初期ユーザーの作成

初回起動時はユーザーが存在しないため、ログイン画面の「新規ユーザー登録」からアカウントを作成してください。

---

## プロキシ環境での利用

社内プロキシ環境下では `.env` に以下を追加してください：

```env
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080
NO_PROXY=localhost,127.0.0.1,db,backend
```

---

## 運用コマンド

```bash
# 停止
docker compose down

# データも含めて完全削除（再セットアップ）
docker compose down -v

# ログ確認
docker compose logs -f backend
docker compose logs -f db

# バックエンドコンテナに入る
docker compose exec backend bash

# DBに直接接続
docker compose exec db psql -U bookuser -d bookdb

# コード変更後の再ビルド・再起動
docker compose up -d --build
```

---

## 機能一覧

- ユーザー認証（登録・ログイン・ログアウト）
- 書籍の登録・編集・削除・検索
- 書籍の保管場所管理
- カテゴリ管理
- 貸出・返却管理（履歴付き）
- CSV / Excel ファイルからの一括インポート

---

## バックエンドテストの実行

```bash
# コンテナ起動後
docker compose exec backend pytest tests/ -v
```

---

## ディレクトリ構成

```
.
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   └── app/
│       ├── main.py
│       ├── core/        # config, database, security
│       ├── models/      # SQLAlchemy ORM
│       ├── schemas/     # Pydantic
│       ├── repositories/
│       ├── services/
│       └── routers/
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── App.tsx
        ├── contexts/
        ├── services/
        ├── components/
        └── pages/
```
