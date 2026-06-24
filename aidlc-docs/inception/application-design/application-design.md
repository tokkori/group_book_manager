# Application Design — 部署内書籍管理アプリ

## 概要

**アーキテクチャスタイル**: レイヤードアーキテクチャ  
**フロントエンド**: React 18 + TypeScript（SPA）  
**バックエンド**: Python 3.12 + FastAPI（REST API）  
**データベース**: PostgreSQL 16（SQLAlchemy ORM）  
**デプロイ**: Docker Compose（frontend / backend / db の3コンテナ）

---

## システム全体像

```
+------------------------------------------------------------------+
|  ブラウザ (React SPA)                                            |
|  +------------------------------------------------------------+  |
|  | Pages: Login / BookList / BookDetail / BookForm /          |  |
|  |        LoanList / Category / Import / UserRegister         |  |
|  | Components: Layout / BookCard / SearchBar / Pagination /   |  |
|  |             ConfirmDialog                                   |  |
|  | Services: apiClient(JWT) / bookService / authService /     |  |
|  |           loanService / categoryService / importService    |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
         |  HTTP/JSON (Port 3000 -> 8000)
         v
+------------------------------------------------------------------+
|  FastAPI (Python 3.12)                                           |
|  +------------------------------------------------------------+  |
|  | Routers: /api/auth / /api/books / /api/categories /        |  |
|  |          /api/loans / /api/import / /health                |  |
|  +------------------------------------------------------------+  |
|  | Services: AuthService / BookService / CategoryService /    |  |
|  |           LoanService / ImportService                      |  |
|  +------------------------------------------------------------+  |
|  | Repositories: UserRepo / BookRepo / CategoryRepo /         |  |
|  |               LoanRepo                                     |  |
|  +------------------------------------------------------------+  |
|  | Core: security(JWT/bcrypt) / config / database(Session)   |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
         |  SQLAlchemy (Port 8000 -> 5432)
         v
+------------------------------------------------------------------+
|  PostgreSQL 16                                                   |
|  Tables: users / books / categories / loan_records              |
+------------------------------------------------------------------+
```

---

## ドメインコンポーネント一覧

| ドメイン | Router | Service | Repository |
|---|---|---|---|
| 認証 | AuthRouter | AuthService | UserRepository |
| 書籍 | BookRouter | BookService | BookRepository |
| カテゴリ | CategoryRouter | CategoryService | CategoryRepository |
| 貸出 | LoanRouter | LoanService | LoanRepository |
| インポート | ImportRouter | ImportService | (BookRepo/CategoryRepo利用) |

---

## 主要ビジネスルール（設計時点）

| ルール | 実装箇所 |
|---|---|
| 貸出中の書籍は削除不可 | BookService.delete_book() |
| 貸出中の書籍への重複貸出不可 | LoanService.borrow_book() |
| カテゴリ削除時は書籍紐付きチェック | CategoryService.delete_category() |
| ユーザー名の重複登録不可 | AuthService.create_user() |
| パスワードはbcryptハッシュ化 | AuthService（core/security経由） |
| 全APIエンドポイントにJWT認証必須 | core/security（DI） |
| CSVインポートでタイトル空行スキップ | ImportService.import_books() |
| CSVインポートでISBN重複行スキップ | ImportService.import_books() |

---

## API エンドポイント概要

### 認証
- `POST /api/auth/login` — JWT取得
- `POST /api/auth/register` — ユーザー登録
- `GET /api/auth/me` — ログイン中ユーザー情報

### 書籍
- `GET /api/books` — 一覧（検索・フィルター・ページネーション）
- `POST /api/books` — 登録
- `GET /api/books/{id}` — 詳細（貸出状況・履歴含む）
- `PUT /api/books/{id}` — 更新
- `DELETE /api/books/{id}` — 削除

### カテゴリ
- `GET/POST /api/categories`
- `PUT/DELETE /api/categories/{id}`

### 貸出
- `GET /api/loans` — 貸出中一覧
- `POST /api/loans` — 貸出申請
- `PUT /api/loans/{id}/return` — 返却
- `GET /api/loans/history/{book_id}` — 書籍の貸出履歴

### インポート
- `POST /api/import/books` — CSV/Excelアップロード

---

## フロントエンドルーティング概要

| パス | ページ | 認証 |
|---|---|---|
| /login | LoginPage | 不要 |
| /register | UserRegisterPage | 不要 |
| / | BookListPage | 要 |
| /books/new | BookFormPage（新規） | 要 |
| /books/:id | BookDetailPage | 要 |
| /books/:id/edit | BookFormPage（編集） | 要 |
| /loans | LoanListPage | 要 |
| /categories | CategoryPage | 要 |
| /import | ImportPage | 要 |

---

## 詳細ドキュメント参照

- コンポーネント詳細: `components.md`
- メソッドシグネチャ: `component-methods.md`
- APIサービス定義: `services.md`
- 依存関係: `component-dependency.md`
