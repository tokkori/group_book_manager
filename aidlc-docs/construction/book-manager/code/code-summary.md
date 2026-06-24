# コード生成サマリー — book-manager

## 生成ファイル一覧

### ルート
- `docker-compose.yml` — 3コンテナ構成（db/backend/frontend）、プロキシ対応
- `.env.example` — 環境変数テンプレート
- `.gitignore`
- `README.md` — 起動手順・運用コマンド

### backend/
- `Dockerfile` — python:3.12-slim、非rootユーザー、alembic upgrade head 自動実行
- `requirements.txt` — FastAPI, SQLAlchemy, Alembic, bcrypt, python-jose, openpyxl 等
- `alembic.ini`, `alembic/env.py`, `alembic/versions/0001_initial.py`, `alembic/versions/0002_add_locations.py`
- `app/core/config.py` — pydantic-settings
- `app/core/database.py` — SQLAlchemy セッション
- `app/core/security.py` — JWT + bcrypt（直接使用、passlib廃止）
- `app/models/` — User, Category, Book, LoanRecord, Location
- `app/schemas/` — auth, category, book, loan, location
- `app/repositories/` — user, category, book, loan, location
- `app/services/` — auth, category, book, loan, import, location
- `app/routers/` — auth, categories, books, loans, import_data, locations
- `app/main.py` — FastAPI アプリ、CORS設定、ルーター登録
- `tests/conftest.py`, `tests/test_auth.py`, `tests/test_books.py`
- `tests/test_categories.py`, `tests/test_loans.py`, `tests/test_import.py`

### frontend/
- `Dockerfile` — マルチステージ（Node.js builder + nginx:alpine）、プロキシビルドarg対応
- `nginx.conf` — SPA対応 + /api プロキシ + 静的アセットキャッシュ
- `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`
- `index.html`, `src/main.tsx`, `src/index.css`
- `src/types/index.ts` — 全型定義（LocationResponse追加）
- `src/App.tsx` — ルーティング（PrivateRoute/PublicRoute、/locations追加）
- `src/contexts/AuthContext.tsx` — JWT + currentUser 管理
- `src/services/` — apiClient, authService, bookService, categoryService, loanService, importService, locationService
- `src/components/` — Layout（保管場所ナビ追加）, BookCard, SearchBar, Pagination, ConfirmDialog
- `src/pages/` — LoginPage, UserRegisterPage, BookListPage, BookDetailPage, BookFormPage（カテゴリ・保管場所ドロップダウン）, LoanListPage（ソート・フィルター付き）, CategoryPage, LocationPage, ImportPage

## ストーリーカバレッジ
全 US-01〜US-18 実装済み

## 追加変更履歴（Code Generation 後）

### 保管場所のマスター化
- `locations` テーブル追加（id, name）
- `books.location` (テキスト) → `books.location_id` (FK) に変更
- Location モデル / スキーマ / リポジトリ / サービス / ルーター 追加
- フロントエンド: LocationPage 追加、BookFormPage の保管場所フィールドをドロップダウンに変更
- ナビゲーションに「保管場所」リンク追加

### 貸出管理のソート・フィルター機能
- LoanListPage にテーブルヘッダークリックでのソート機能追加（書籍名・借り手・貸出日）
- 借り手ドロップダウンフィルターによる絞り込み機能追加

### バグ修正
- bcrypt 72バイト制限対応（passlib廃止 → bcryptライブラリ直接使用）
- BookResponse `is_borrowed` フィールドの model_validate エラー修正
- BookFormPage カテゴリ/保管場所未選択時のバリデーションエラー修正
- frontend Dockerfile の `npm ci` → `npm install` 修正（package-lock.json不要化）
