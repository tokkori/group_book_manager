# 書籍管理システム — Claude 向けプロジェクトコンテキスト

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Python 3.12 + FastAPI |
| DB | PostgreSQL 16 |
| 認証 | JWT (python-jose) + bcrypt (passlib) |
| 実行環境 | Docker + Docker Compose |

## ディレクトリ構成と責務

```
backend/app/
  models/        # SQLAlchemy ORM モデル
  schemas/       # Pydantic スキーマ（リクエスト・レスポンス型）
  repositories/  # DB アクセス層（生 SQL 禁止、ORM のみ）
  services/      # ビジネスロジック
  routers/       # FastAPI ルーター（thin、ロジックはserviceへ）

frontend/src/
  types/index.ts     # 全フロントエンド型定義（ここで一元管理）
  services/          # API 呼び出し（1ファイル = 1リソース）
  components/        # 再利用可能 UI コンポーネント
  pages/             # ページ単位のコンポーネント
  contexts/          # React Context
```

## 既存モデル

- `User` — id, username, hashed_password, created_at
- `Book` — id, title, author, isbn, category_id, location_id, created_at
- `Category` — id, name
- `Location` — id, name, description
- `LoanRecord` — id, book_id, user_id, loaned_at, returned_at

## 開発ルール

- バックエンド変更後は必ず `docker compose exec backend pytest tests/ -v` を実行
- 新規エンドポイント追加時は `routers/` + `services/` + `repositories/` + `schemas/` をすべて更新
- 新規モデル追加時は `models/` に追加し、`models/__init__.py` にインポートを追加する
- フロント型変更は必ず `src/types/index.ts` を起点にする
- API の URL プレフィックスは `/api/v1/` を使用する

## よく使うコマンド

```bash
# バックエンドテスト
docker compose exec backend pytest tests/ -v

# バックエンドログ
docker compose logs -f backend

# DBマイグレーション（Alembic）
docker compose exec backend alembic revision --autogenerate -m "説明"
docker compose exec backend alembic upgrade head

# フロント型チェック
cd frontend && npx tsc --noEmit

# 再ビルド
docker compose up -d --build
```

## harness/ ディレクトリ（ハーネス用アーティファクト）

```
harness/
  spec.md                      # Planner が生成する詳細仕様
  sprint_contract_backend.md   # バックエンドスプリント前の合意仕様
  sprint_contract_frontend.md  # フロントエンドスプリント前の合意仕様
  qa_report.md                 # QA エージェントの検証レポート
```
