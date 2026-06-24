# Code Generation Plan — book-manager

## ユニット情報
- **ユニット名**: book-manager
- **ワークスペースルート**: `c:\Users\yuma\Documents\kiro_test`
- **コード配置先**: `c:\Users\yuma\Documents\kiro_test\backend\` および `c:\Users\yuma\Documents\kiro_test\frontend\`
- **ドキュメント**: `aidlc-docs/construction/book-manager/code/`

## ストーリーカバレッジ
US-01〜US-18（全18ストーリー）をこのユニットで実装

---

## Step 1: プロジェクト構造セットアップ
- [ ] 1.1 ルートファイル生成: `docker-compose.yml`, `.env.example`, `.gitignore`
- [ ] 1.2 バックエンドディレクトリ構造: `backend/` 以下の全ディレクトリ・空ファイル作成
- [ ] 1.3 フロントエンドディレクトリ構造: `frontend/` 以下の全ディレクトリ・空ファイル作成

## Step 2: バックエンド — Core / 設定
- [ ] 2.1 `backend/requirements.txt`
- [ ] 2.2 `backend/Dockerfile`
- [ ] 2.3 `backend/app/core/config.py` — pydantic-settings による環境変数管理
- [ ] 2.4 `backend/app/core/database.py` — SQLAlchemy エンジン・セッション
- [ ] 2.5 `backend/app/core/security.py` — JWT生成/検証・bcryptハッシュ化

## Step 3: バックエンド — ORMモデル
- [ ] 3.1 `backend/app/models/base.py` — DeclarativeBase
- [ ] 3.2 `backend/app/models/user.py` — User モデル
- [ ] 3.3 `backend/app/models/category.py` — Category モデル
- [ ] 3.4 `backend/app/models/book.py` — Book モデル（FK: Category）
- [ ] 3.5 `backend/app/models/loan_record.py` — LoanRecord モデル（FK: Book, User）

## Step 4: バックエンド — Alembic マイグレーション
- [ ] 4.1 `backend/alembic.ini`
- [ ] 4.2 `backend/alembic/env.py` — モデルインポート設定
- [ ] 4.3 `backend/alembic/versions/0001_initial.py` — 初回マイグレーション（全テーブル作成）

## Step 5: バックエンド — Pydantic スキーマ
- [ ] 5.1 `backend/app/schemas/auth.py` — TokenResponse, UserCreate, UserResponse
- [ ] 5.2 `backend/app/schemas/category.py` — CategoryCreate/Update/Response
- [ ] 5.3 `backend/app/schemas/book.py` — BookCreate/Update/Response/ListResponse/DetailResponse
- [ ] 5.4 `backend/app/schemas/loan.py` — LoanResponse, ImportResult

## Step 6: バックエンド — Repository 層
- [ ] 6.1 `backend/app/repositories/user_repository.py`
- [ ] 6.2 `backend/app/repositories/category_repository.py`
- [ ] 6.3 `backend/app/repositories/book_repository.py`
- [ ] 6.4 `backend/app/repositories/loan_repository.py`

## Step 7: バックエンド — Service 層
- [ ] 7.1 `backend/app/services/auth_service.py` (US-01, US-02, US-03)
- [ ] 7.2 `backend/app/services/category_service.py` (US-12, US-13)
- [ ] 7.3 `backend/app/services/book_service.py` (US-04〜US-11)
- [ ] 7.4 `backend/app/services/loan_service.py` (US-14〜US-17)
- [ ] 7.5 `backend/app/services/import_service.py` (US-18)

## Step 8: バックエンド — Router 層
- [ ] 8.1 `backend/app/routers/auth.py` (US-01, US-02, US-03)
- [ ] 8.2 `backend/app/routers/categories.py` (US-12, US-13)
- [ ] 8.3 `backend/app/routers/books.py` (US-04〜US-11)
- [ ] 8.4 `backend/app/routers/loans.py` (US-14〜US-17)
- [ ] 8.5 `backend/app/routers/import_data.py` (US-18)
- [ ] 8.6 `backend/app/main.py` — FastAPI アプリ初期化・ルーター登録・CORS設定・ヘルスチェック

## Step 9: バックエンド — ユニットテスト
- [ ] 9.1 `backend/tests/conftest.py` — pytest fixtures（テストDB・テストクライアント）
- [ ] 9.2 `backend/tests/test_auth.py` — ログイン・登録・JWT検証テスト
- [ ] 9.3 `backend/tests/test_books.py` — 書籍CRUD・検索・削除チェックテスト
- [ ] 9.4 `backend/tests/test_categories.py` — カテゴリCRUD・削除チェックテスト
- [ ] 9.5 `backend/tests/test_loans.py` — 貸出・返却・重複チェックテスト
- [ ] 9.6 `backend/tests/test_import.py` — CSVインポートテスト

## Step 10: フロントエンド — プロジェクト設定
- [ ] 10.1 `frontend/package.json` — 依存関係定義（React 18, TypeScript, Vite, TanStack Query, React Hook Form, Zod, Axios, Tailwind, shadcn/ui, react-router-dom, react-hot-toast）
- [ ] 10.2 `frontend/tsconfig.json`
- [ ] 10.3 `frontend/vite.config.ts`
- [ ] 10.4 `frontend/tailwind.config.ts`
- [ ] 10.5 `frontend/index.html`

## Step 11: フロントエンド — 共通 / インフラ
- [ ] 11.1 `frontend/src/services/apiClient.ts` — axios + JWT自動付与 + 401リダイレクト
- [ ] 11.2 `frontend/src/contexts/AuthContext.tsx` — currentUser の React Context
- [ ] 11.3 `frontend/src/components/Layout.tsx` — ヘッダー + ナビゲーション
- [ ] 11.4 `frontend/src/components/ConfirmDialog.tsx`
- [ ] 11.5 `frontend/src/components/Pagination.tsx`
- [ ] 11.6 `frontend/src/App.tsx` — ルーティング定義（PublicRoute / PrivateRoute）
- [ ] 11.7 `frontend/src/main.tsx`

## Step 12: フロントエンド — サービス層
- [ ] 12.1 `frontend/src/services/authService.ts` (US-01, US-02, US-03)
- [ ] 12.2 `frontend/src/services/categoryService.ts` (US-12, US-13)
- [ ] 12.3 `frontend/src/services/bookService.ts` (US-04〜US-11)
- [ ] 12.4 `frontend/src/services/loanService.ts` (US-14〜US-17)
- [ ] 12.5 `frontend/src/services/importService.ts` (US-18)

## Step 13: フロントエンド — 認証ページ
- [ ] 13.1 `frontend/src/pages/LoginPage.tsx` (US-01)
- [ ] 13.2 `frontend/src/pages/UserRegisterPage.tsx` (US-03)

## Step 14: フロントエンド — 書籍コンポーネント
- [ ] 14.1 `frontend/src/components/BookCard.tsx`
- [ ] 14.2 `frontend/src/components/SearchBar.tsx`

## Step 15: フロントエンド — 書籍ページ
- [ ] 15.1 `frontend/src/pages/BookListPage.tsx` (US-04, US-05, US-06)
- [ ] 15.2 `frontend/src/pages/BookDetailPage.tsx` (US-07, US-14, US-15, US-17)
- [ ] 15.3 `frontend/src/pages/BookFormPage.tsx` (US-08, US-09, US-10, US-11)

## Step 16: フロントエンド — その他ページ
- [ ] 16.1 `frontend/src/pages/LoanListPage.tsx` (US-16)
- [ ] 16.2 `frontend/src/pages/CategoryPage.tsx` (US-12, US-13)
- [ ] 16.3 `frontend/src/pages/ImportPage.tsx` (US-18)

## Step 17: フロントエンド — Dockerfile + Nginx
- [ ] 17.1 `frontend/Dockerfile` — マルチステージビルド（Node.js builder + nginx:alpine）
- [ ] 17.2 `frontend/nginx.conf` — SPA対応 + /api プロキシ設定

## Step 18: デプロイ設定
- [ ] 18.1 `docker-compose.yml` — プロキシ対応済み完全版
- [ ] 18.2 `.env.example` — 全環境変数テンプレート
- [ ] 18.3 `.gitignore` — .env, __pycache__, node_modules 等

## Step 19: ドキュメント
- [ ] 19.1 `README.md` — 起動手順・運用コマンド・初期ユーザー作成方法
- [ ] 19.2 `aidlc-docs/construction/book-manager/code/code-summary.md` — 生成ファイル一覧

---

## ストーリー対応表

| ストーリー | 実装ステップ |
|---|---|
| US-01 ログイン | Step 7.1, 8.1, 13.1 |
| US-02 ログアウト | Step 11.3 (Layout) |
| US-03 ユーザー登録 | Step 7.1, 8.1, 13.2 |
| US-04 書籍一覧 | Step 7.3, 8.3, 15.1 |
| US-05 書籍検索 | Step 7.3, 8.3, 15.1 |
| US-06 カテゴリフィルター | Step 7.3, 8.3, 15.1 |
| US-07 書籍詳細 | Step 7.3, 8.3, 15.2 |
| US-08 書籍登録 | Step 7.3, 8.3, 15.3 |
| US-09 書籍編集 | Step 7.3, 8.3, 15.3 |
| US-10 書籍削除 | Step 7.3, 8.3, 15.3 |
| US-11 保管場所管理 | Step 7.3, 8.3, 15.3 |
| US-12 カテゴリ作成 | Step 7.2, 8.2, 16.2 |
| US-13 カテゴリ編集/削除 | Step 7.2, 8.2, 16.2 |
| US-14 貸出申請 | Step 7.4, 8.4, 15.2 |
| US-15 返却 | Step 7.4, 8.4, 15.2 |
| US-16 貸出状況確認 | Step 7.4, 8.4, 16.1 |
| US-17 貸出履歴 | Step 7.4, 8.4, 15.2 |
| US-18 Excelインポート | Step 7.5, 8.5, 16.3 |
