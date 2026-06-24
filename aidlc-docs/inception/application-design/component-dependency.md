# コンポーネント依存関係

## バックエンド — レイヤー依存関係

```
HTTPリクエスト
     |
     v
[Router層]          BC-01 AuthRouter
                    BC-04 BookRouter
                    BC-07 CategoryRouter
                    BC-10 LoanRouter
                    BC-13 ImportRouter
     |
     v
[Service層]         BC-02 AuthService
                    BC-05 BookService
                    BC-08 CategoryService
                    BC-11 LoanService
                    BC-14 ImportService
     |
     v
[Repository層]      BC-03 UserRepository
                    BC-06 BookRepository
                    BC-09 CategoryRepository
                    BC-12 LoanRepository
     |
     v
[DB]                PostgreSQL (via SQLAlchemy)
```

### クロスサービス依存

| Service | 依存先 Repository |
|---|---|
| AuthService | UserRepository |
| BookService | BookRepository, CategoryRepository |
| CategoryService | CategoryRepository, BookRepository（紐付きチェック） |
| LoanService | LoanRepository, BookRepository（貸出中チェック） |
| ImportService | BookRepository, CategoryRepository |

### 共通依存（全Router → core）

| コンポーネント | 用途 |
|---|---|
| core/security.py | JWT検証 Dependency Injection（全認証必要エンドポイント） |
| core/database.py | DB Session Dependency Injection（全Repository） |
| core/config.py | 設定値参照（全モジュール） |

---

## フロントエンド — コンポーネント依存関係

```
[ページ層]
  BookListPage  ---> BookCard, SearchBar, Pagination, bookService, categoryService
  BookDetailPage --> ConfirmDialog, loanService, bookService
  BookFormPage  ---> bookService, categoryService
  LoanListPage  ---> loanService
  CategoryPage  ---> ConfirmDialog, categoryService
  ImportPage    ---> importService
  LoginPage     ---> authService
  UserRegisterPage -> authService

[共通コンポーネント]
  Layout        ---> authService（ログアウト）

[サービス層]
  全サービス    ---> apiClient（JWTヘッダー自動付与）
```

### 認証フロー依存

```
apiClient（axios instance）
  - リクエスト前: localStorage から JWT を取得し Authorization ヘッダーに付与
  - レスポンス後: 401 受信時に /login へリダイレクト

ProtectedRoute（router設定）
  - JWTが localStorage に存在しない場合 /login にリダイレクト
```

---

## フロントエンド ↔ バックエンド 通信マッピング

| フロントエンドサービス | バックエンドRouter |
|---|---|
| authService | BC-01 AuthRouter |
| bookService | BC-04 BookRouter |
| categoryService | BC-07 CategoryRouter |
| loanService | BC-10 LoanRouter |
| importService | BC-13 ImportRouter |
