# サービス定義 — REST API エンドポイント一覧

## バックエンド REST API

### 認証 (/api/auth)

| メソッド | パス | 説明 | 認証要否 |
|---|---|---|---|
| POST | /api/auth/login | ログイン → JWT返却 | 不要 |
| POST | /api/auth/register | ユーザー登録 | 不要 |
| GET | /api/auth/me | ログイン中ユーザー情報取得 | 要 |

---

### 書籍 (/api/books)

| メソッド | パス | 説明 | 認証要否 |
|---|---|---|---|
| GET | /api/books | 書籍一覧（keyword, category_id, page, size クエリパラメータ） | 要 |
| POST | /api/books | 書籍登録 | 要 |
| GET | /api/books/{book_id} | 書籍詳細（貸出状況・履歴含む） | 要 |
| PUT | /api/books/{book_id} | 書籍更新 | 要 |
| DELETE | /api/books/{book_id} | 書籍削除（貸出中は不可） | 要 |

---

### カテゴリ (/api/categories)

| メソッド | パス | 説明 | 認証要否 |
|---|---|---|---|
| GET | /api/categories | カテゴリ一覧 | 要 |
| POST | /api/categories | カテゴリ作成 | 要 |
| PUT | /api/categories/{category_id} | カテゴリ更新 | 要 |
| DELETE | /api/categories/{category_id} | カテゴリ削除（書籍紐付きは不可） | 要 |

---

### 貸出・返却 (/api/loans)

| メソッド | パス | 説明 | 認証要否 |
|---|---|---|---|
| GET | /api/loans | 現在の貸出中一覧 | 要 |
| POST | /api/loans | 貸出申請（body: book_id） | 要 |
| PUT | /api/loans/{loan_id}/return | 返却処理 | 要 |
| GET | /api/loans/history/{book_id} | 書籍の貸出履歴 | 要 |

---

### インポート (/api/import)

| メソッド | パス | 説明 | 認証要否 |
|---|---|---|---|
| POST | /api/import/books | CSV/Excelファイルアップロード → 一括書籍登録 | 要 |

---

### 保管場所 (/api/locations)

| メソッド | パス | 説明 | 認証要否 |
|---|---|---|---|
| GET | /api/locations | 保管場所一覧 | 要 |
| POST | /api/locations | 保管場所作成 | 要 |
| PUT | /api/locations/{location_id} | 保管場所更新 | 要 |
| DELETE | /api/locations/{location_id} | 保管場所削除（書籍紐付きは不可） | 要 |

---

### ヘルスチェック

| メソッド | パス | 説明 | 認証要否 |
|---|---|---|---|
| GET | /health | サービス稼働確認 | 不要 |

---

## フロントエンド — ルーティング

| パス | コンポーネント | 認証要否 |
|---|---|---|
| /login | LoginPage | 不要 |
| /register | UserRegisterPage | 不要 |
| / | BookListPage | 要 |
| /books/new | BookFormPage（新規） | 要 |
| /books/:id | BookDetailPage | 要 |
| /books/:id/edit | BookFormPage（編集） | 要 |
| /loans | LoanListPage | 要 |
| /categories | CategoryPage | 要 |
| /locations | LocationPage | 要 |
| /import | ImportPage | 要 |

---

## フロントエンド API サービス

### authService
```typescript
login(username, password): Promise<TokenResponse>
register(username, displayName, password): Promise<UserResponse>
getMe(): Promise<UserResponse>
```

### bookService
```typescript
getBooks(params: { keyword?, categoryId?, page?, size? }): Promise<BookListResponse>
getBook(bookId: number): Promise<BookDetailResponse>
createBook(data: BookCreate): Promise<BookResponse>
updateBook(bookId: number, data: BookUpdate): Promise<BookResponse>
deleteBook(bookId: number): Promise<void>
```

### categoryService
```typescript
getCategories(): Promise<CategoryResponse[]>
createCategory(data: CategoryCreate): Promise<CategoryResponse>
updateCategory(categoryId: number, data: CategoryUpdate): Promise<CategoryResponse>
deleteCategory(categoryId: number): Promise<void>
```

### loanService
```typescript
getActiveLoans(): Promise<LoanResponse[]>
borrowBook(bookId: number): Promise<LoanResponse>
returnBook(loanId: number): Promise<LoanResponse>
getLoanHistory(bookId: number): Promise<LoanResponse[]>
```

### importService
```typescript
importBooks(file: File): Promise<ImportResult>
```
