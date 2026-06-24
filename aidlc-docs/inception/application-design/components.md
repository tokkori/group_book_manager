# コンポーネント定義

## バックエンド（FastAPI）

### レイヤー構成
```
app/
  routers/        # HTTPリクエストの受け口（FastAPI Router）
  services/       # ビジネスロジック
  repositories/   # DBアクセス（SQLAlchemy）
  models/         # SQLAlchemy ORMモデル
  schemas/        # Pydantic スキーマ（入出力バリデーション）
  core/           # 設定・認証ユーティリティ
```

---

### BC-01: AuthRouter（routers/auth.py）
- **責務**: ログイン・ログアウト・ユーザー登録のHTTPエンドポイント
- **依存**: AuthService

### BC-02: AuthService（services/auth_service.py）
- **責務**: 認証ロジック（パスワード検証・JWTトークン生成・ユーザー作成）
- **依存**: UserRepository, core/security

### BC-03: UserRepository（repositories/user_repository.py）
- **責務**: Userテーブルへのデータアクセス（取得・作成）
- **依存**: DB Session

---

### BC-04: BookRouter（routers/books.py）
- **責務**: 書籍CRUD・検索・フィルタリングのHTTPエンドポイント
- **依存**: BookService

### BC-05: BookService（services/book_service.py）
- **責務**: 書籍のビジネスロジック（貸出中チェック・重複ISBNチェック等）
- **依存**: BookRepository, CategoryRepository

### BC-06: BookRepository（repositories/book_repository.py）
- **責務**: Bookテーブルへのデータアクセス（CRUD・検索クエリ）
- **依存**: DB Session

---

### BC-07: CategoryRouter（routers/categories.py）
- **責務**: カテゴリCRUDのHTTPエンドポイント
- **依存**: CategoryService

### BC-08: CategoryService（services/category_service.py）
- **責務**: カテゴリのビジネスロジック（書籍紐付きチェック等）
- **依存**: CategoryRepository, BookRepository

### BC-09: CategoryRepository（repositories/category_repository.py）
- **責務**: Categoryテーブルへのデータアクセス
- **依存**: DB Session

---

### BC-10: LoanRouter（routers/loans.py）
- **責務**: 貸出・返却・履歴確認のHTTPエンドポイント
- **依存**: LoanService

### BC-11: LoanService（services/loan_service.py）
- **責務**: 貸出ビジネスロジック（貸出中チェック・返却処理等）
- **依存**: LoanRepository, BookRepository

### BC-12: LoanRepository（repositories/loan_repository.py）
- **責務**: LoanRecordテーブルへのデータアクセス
- **依存**: DB Session

---

### BC-13: ImportRouter（routers/import_data.py）
- **責務**: CSV/Excelファイルアップロードのエンドポイント
- **依存**: ImportService

### BC-14: ImportService（services/import_service.py）
- **責務**: ファイル解析・バリデーション・一括書籍登録
- **依存**: BookRepository, CategoryRepository

---

### BC-15: Core / Security（core/security.py）
- **責務**: JWTトークン生成・検証・パスワードハッシュ化
- **依存**: python-jose, passlib

### BC-16: Core / Config（core/config.py）
- **責務**: 環境変数・アプリ設定の管理
- **依存**: pydantic-settings

### BC-17: Core / Database（core/database.py）
- **責務**: SQLAlchemy エンジン・セッション管理
- **依存**: SQLAlchemy, PostgreSQL

---

## フロントエンド（React + TypeScript）

### ページコンポーネント

### FC-01: LoginPage（pages/LoginPage.tsx）
- **責務**: ログインフォームの表示・送信処理
- **状態**: username, password, エラーメッセージ

### FC-02: BookListPage（pages/BookListPage.tsx）
- **責務**: 書籍一覧・検索・カテゴリフィルタリング
- **状態**: 書籍リスト, 検索キーワード, 選択カテゴリ, ページ番号

### FC-03: BookDetailPage（pages/BookDetailPage.tsx）
- **責務**: 書籍詳細表示・貸出/返却ボタン・貸出履歴
- **状態**: 書籍データ, 貸出履歴リスト

### FC-04: BookFormPage（pages/BookFormPage.tsx）
- **責務**: 書籍登録・編集フォーム（新規/編集で共用）
- **状態**: フォームフィールド, バリデーションエラー

### FC-05: LoanListPage（pages/LoanListPage.tsx）
- **責務**: 現在の貸出状況一覧・返却ボタン
- **状態**: 貸出中リスト

### FC-06: CategoryPage（pages/CategoryPage.tsx）
- **責務**: カテゴリ一覧・作成・編集・削除
- **状態**: カテゴリリスト, 編集中カテゴリ

### FC-07: ImportPage（pages/ImportPage.tsx）
- **責務**: CSV/Excelファイルアップロード・インポート結果表示
- **状態**: ファイル, インポート結果

### FC-08: UserRegisterPage（pages/UserRegisterPage.tsx）
- **責務**: ユーザー登録フォーム
- **状態**: フォームフィールド, エラーメッセージ

---

### 共通コンポーネント

### FC-09: Layout（components/Layout.tsx）
- **責務**: ヘッダー・ナビゲーション・フッターの共通レイアウト

### FC-10: BookCard（components/BookCard.tsx）
- **責務**: 書籍一覧での書籍カード表示（タイトル・著者・状態バッジ）

### FC-11: SearchBar（components/SearchBar.tsx）
- **責務**: 検索ボックス・カテゴリフィルター

### FC-12: Pagination（components/Pagination.tsx）
- **責務**: ページネーションコントロール

### FC-13: ConfirmDialog（components/ConfirmDialog.tsx）
- **責務**: 削除・操作確認ダイアログ

---

### サービス層（フロントエンド）

### FC-14: apiClient（services/apiClient.ts）
- **責務**: axios インスタンス。JWTトークンをヘッダーに自動付与・401時にリダイレクト

### FC-15: authService（services/authService.ts）
- **責務**: ログイン・ログアウト・ユーザー登録のAPI呼び出し

### FC-16: bookService（services/bookService.ts）
- **責務**: 書籍CRUD・検索のAPI呼び出し

### FC-17: categoryService（services/categoryService.ts）
- **責務**: カテゴリCRUDのAPI呼び出し

### FC-18: loanService（services/loanService.ts）
- **責務**: 貸出・返却・履歴のAPI呼び出し

### FC-19: importService（services/importService.ts）
- **責務**: ファイルアップロードのAPI呼び出し
