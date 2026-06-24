# コンポーネントメソッド定義

## バックエンド — サービス層

### AuthService
```python
async def login(username: str, password: str) -> TokenResponse
    # パスワード検証 → JWTトークン生成・返却
    # 失敗時: HTTPException 401

async def create_user(username: str, display_name: str, password: str) -> UserResponse
    # ユーザー名重複チェック → bcryptハッシュ化 → DB保存
    # 重複時: HTTPException 400

async def get_current_user(token: str) -> UserResponse
    # JWTデコード → ユーザー取得
    # 無効トークン時: HTTPException 401
```

### BookService
```python
async def get_books(skip: int, limit: int, keyword: str | None, category_id: int | None) -> BookListResponse
    # キーワード検索（タイトル/著者/ISBNのOR検索）+ カテゴリフィルター

async def get_book(book_id: int) -> BookDetailResponse
    # 書籍詳細 + 現在の貸出状況取得
    # 存在しない場合: HTTPException 404

async def create_book(data: BookCreate) -> BookResponse
    # ISBN重複チェック（警告のみ、登録は可）→ DB保存

async def update_book(book_id: int, data: BookUpdate) -> BookResponse
    # 存在確認 → 更新
    # 存在しない場合: HTTPException 404

async def delete_book(book_id: int) -> None
    # 貸出中チェック（貸出中ならHTTPException 400）→ 削除
```

### CategoryService
```python
async def get_categories() -> list[CategoryResponse]

async def create_category(data: CategoryCreate) -> CategoryResponse
    # 名前重複チェック → DB保存
    # 重複時: HTTPException 400

async def update_category(category_id: int, data: CategoryUpdate) -> CategoryResponse

async def delete_category(category_id: int) -> None
    # 書籍紐付きチェック（紐付きありならHTTPException 400）→ 削除
```

### LoanService
```python
async def get_active_loans() -> list[LoanResponse]
    # return_date IS NULL の貸出一覧

async def get_loan_history(book_id: int) -> list[LoanResponse]
    # 書籍の貸出履歴（全件）

async def borrow_book(book_id: int, user_id: int) -> LoanResponse
    # 貸出中チェック（貸出中ならHTTPException 400）→ 貸出記録作成

async def return_book(loan_id: int) -> LoanResponse
    # 存在・未返却チェック → return_date に現在日時をセット
```

### ImportService
```python
async def import_books(file: UploadFile) -> ImportResult
    # ファイル形式判定（CSV/Excel）→ 行パース → バリデーション
    # → タイトル空行スキップ → ISBN重複スキップ → 一括DB保存
    # 戻り値: { success: int, skipped: int, errors: list[str] }
```

---

## バックエンド — Pydantic スキーマ

### 認証
```python
class TokenResponse: access_token: str, token_type: str
class UserCreate: username: str, display_name: str, password: str
class UserResponse: id: int, username: str, display_name: str
```

### 書籍
```python
class BookCreate: title: str, author: str | None, isbn: str | None,
                  publisher: str | None, published_year: int | None,
                  category_id: int | None, location: str | None
class BookUpdate: (BookCreateと同じ、全フィールドOptional)
class BookResponse: id: int, title: str, author, isbn, publisher,
                    published_year, category, location, is_borrowed: bool,
                    created_at, updated_at
class BookListResponse: items: list[BookResponse], total: int, page: int, size: int
class BookDetailResponse: (BookResponse + current_loan + loan_history)
```

### カテゴリ
```python
class CategoryCreate: name: str, description: str | None
class CategoryUpdate: name: str | None, description: str | None
class CategoryResponse: id: int, name: str, description: str | None
```

### 貸出
```python
class LoanResponse: id: int, book_id: int, book_title: str,
                    user_id: int, borrower_name: str,
                    loan_date: date, return_date: date | None
```

### インポート
```python
class ImportResult: success: int, skipped: int, errors: list[str]
```

---

## フロントエンド — ページProps/State

### BookListPage
```typescript
// State
interface BookListState {
  books: BookResponse[]
  total: number
  page: number
  keyword: string
  categoryId: number | null
  isLoading: boolean
}
```

### BookDetailPage
```typescript
// Props
interface BookDetailProps { bookId: number }
// State
interface BookDetailState {
  book: BookDetailResponse | null
  isLoading: boolean
}
```

### BookFormPage
```typescript
// Props
interface BookFormProps { bookId?: number }  // undefinedなら新規登録
// State: React Hook Form + zodバリデーション
```

### FC-14: apiClient の認証ヘッダー自動付与
```typescript
// リクエストインターセプター
config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
// レスポンスインターセプター
if (error.response?.status === 401) { navigate('/login') }
```
