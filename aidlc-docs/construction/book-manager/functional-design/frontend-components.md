# フロントエンドコンポーネント設計

## ルーティング構成

```
App
├── PublicRoute（未認証時のみアクセス可）
│   ├── /login         → LoginPage
│   └── /register      → UserRegisterPage
└── PrivateRoute（JWT必須、未認証時は/loginへリダイレクト）
    └── Layout（ヘッダー + ナビ）
        ├── /              → BookListPage
        ├── /books/new     → BookFormPage (mode="create")
        ├── /books/:id     → BookDetailPage
        ├── /books/:id/edit → BookFormPage (mode="edit")
        ├── /loans         → LoanListPage
        ├── /categories    → CategoryPage
        └── /import        → ImportPage
```

---

## LoginPage

**Props**: なし  
**State**: `{ username, password, error, isLoading }`

**コンポーネント構造:**
```
LoginPage
├── <form data-testid="login-form">
│   ├── <input data-testid="login-username-input" />
│   ├── <input type="password" data-testid="login-password-input" />
│   ├── <p data-testid="login-error-message" /> (エラー時のみ表示)
│   └── <button data-testid="login-submit-button">ログイン</button>
└── <Link to="/register">新規登録</Link>
```

**フォームバリデーション（送信前）:**
- username: 必須
- password: 必須

**API統合**: `authService.login()` → 成功時 JWTを localStorage に保存、`/` へリダイレクト

---

## UserRegisterPage

**Props**: なし  
**State**: `{ username, displayName, password, confirmPassword, error, isLoading }`

**コンポーネント構造:**
```
UserRegisterPage
├── <form data-testid="register-form">
│   ├── <input data-testid="register-username-input" />
│   ├── <input data-testid="register-displayname-input" />
│   ├── <input type="password" data-testid="register-password-input" />
│   ├── <input type="password" data-testid="register-confirm-password-input" />
│   ├── <p data-testid="register-error-message" />
│   └── <button data-testid="register-submit-button">登録</button>
└── <Link to="/login">ログインに戻る</Link>
```

**フォームバリデーション:**
- username: 必須、3〜50文字、英数字・アンダースコア・ハイフン
- displayName: 必須
- password: 必須、8文字以上
- confirmPassword: passwordと一致すること

---

## BookListPage

**Props**: なし  
**State**: `{ books, total, page, keyword, categoryId, categories, isLoading }`

**コンポーネント構造:**
```
BookListPage
├── SearchBar
│   ├── <input data-testid="search-keyword-input" />
│   └── <select data-testid="search-category-select" />
├── <div data-testid="book-list">
│   └── BookCard[] (書籍カード一覧)
├── <p data-testid="book-list-empty"> (0件時)
├── Pagination
│   ├── <button data-testid="pagination-prev-button" />
│   ├── <span data-testid="pagination-current-page" />
│   └── <button data-testid="pagination-next-button" />
└── <Link data-testid="add-book-button" to="/books/new">書籍を登録</Link>
```

**API統合:**
- マウント時・検索条件変更時: `bookService.getBooks()`
- マウント時: `categoryService.getCategories()`

---

## BookCard

**Props**: `{ book: BookResponse, onClick: () => void }`

**コンポーネント構造:**
```
<div data-testid={`book-card-${book.id}`} onClick={onClick}>
  <h3 data-testid={`book-title-${book.id}`}>{book.title}</h3>
  <p>{book.author}</p>
  <span data-testid={`book-status-badge-${book.id}`}>
    {book.is_borrowed ? "貸出中" : "在架"}
  </span>
  <p>{book.location}</p>
</div>
```

---

## BookDetailPage

**Props**: `{ bookId: number }` (useParams から取得)  
**State**: `{ book, isLoading, showDeleteConfirm }`

**コンポーネント構造:**
```
BookDetailPage
├── 書籍情報表示
│   ├── タイトル・著者・ISBN・出版社・出版年・カテゴリ・保管場所
│   └── <span data-testid="book-detail-status"> (在架/貸出中)
├── アクションボタン
│   ├── <button data-testid="book-borrow-button"> (在架時のみ表示)
│   ├── <button data-testid="book-return-button"> (貸出中時のみ表示)
│   ├── <button data-testid="book-edit-button">
│   └── <button data-testid="book-delete-button">
├── ConfirmDialog (削除確認)
└── 貸出履歴テーブル
    └── <table data-testid="loan-history-table">
```

**API統合:**
- マウント時: `bookService.getBook()`, `loanService.getLoanHistory()`
- 貸出: `loanService.borrowBook()` → 画面リロード
- 返却: `loanService.returnBook()` → 画面リロード
- 削除: `bookService.deleteBook()` → `/` へリダイレクト

---

## BookFormPage

**Props**: `{ mode: "create" | "edit", bookId?: number }`  
**State**: React Hook Form (zod スキーマバリデーション)

**zodスキーマ:**
```typescript
const bookSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(500),
  author: z.string().max(200).optional(),
  isbn: z.string().max(20).optional(),
  publisher: z.string().max(200).optional(),
  published_year: z.number().int().min(1000).max(currentYear).optional(),
  category_id: z.number().int().optional(),
  location: z.string().max(200).optional(),
})
```

**コンポーネント構造:**
```
BookFormPage
└── <form data-testid="book-form">
    ├── <input data-testid="book-form-title-input" />
    ├── <input data-testid="book-form-author-input" />
    ├── <input data-testid="book-form-isbn-input" />
    ├── <input data-testid="book-form-publisher-input" />
    ├── <input data-testid="book-form-year-input" />
    ├── <select data-testid="book-form-category-select" />
    ├── <input data-testid="book-form-location-input" />
    ├── <p data-testid="book-form-isbn-warning"> (ISBN重複時)
    ├── <button data-testid="book-form-submit-button">保存</button>
    └── <button data-testid="book-form-cancel-button">キャンセル</button>
```

---

## LoanListPage

**State**: `{ activeLoans, isLoading }`

**コンポーネント構造:**
```
LoanListPage
└── <table data-testid="active-loans-table">
    └── rows: 書籍名・借り手名・貸出日
        └── <button data-testid={`return-button-${loan.id}`}>返却</button>
```

---

## CategoryPage

**State**: `{ categories, editingId, editName, editDesc, newName, newDesc, isLoading }`

**コンポーネント構造:**
```
CategoryPage
├── <form data-testid="category-create-form">
│   ├── <input data-testid="category-name-input" />
│   ├── <input data-testid="category-desc-input" />
│   └── <button data-testid="category-create-button">作成</button>
└── <ul data-testid="category-list">
    └── items:
        ├── カテゴリ名・説明 (表示 or 編集フォーム)
        ├── <button data-testid={`category-edit-button-${cat.id}`}>編集</button>
        └── <button data-testid={`category-delete-button-${cat.id}`}>削除</button>
```

---

## ImportPage

**State**: `{ file, result, isLoading, error }`

**コンポーネント構造:**
```
ImportPage
├── <input type="file" data-testid="import-file-input" accept=".csv,.xlsx,.xls" />
├── <button data-testid="import-submit-button">インポート</button>
└── インポート結果 (data-testid="import-result")
    ├── <p>成功: {result.success}件</p>
    ├── <p>スキップ: {result.skipped}件</p>
    └── <ul> エラー詳細リスト </ul>
```

---

## ConfirmDialog（共通）

**Props**: `{ isOpen, title, message, onConfirm, onCancel }`

```
<dialog data-testid="confirm-dialog">
  <p data-testid="confirm-dialog-message">{message}</p>
  <button data-testid="confirm-dialog-ok-button">確認</button>
  <button data-testid="confirm-dialog-cancel-button">キャンセル</button>
</dialog>
```

---

## 状態管理方針

- **認証状態**: localStorage（JWTトークン） + React Context（currentUser）
- **サーバーデータ**: TanStack Query（React Query）でキャッシュ・再取得管理
- **フォーム**: React Hook Form + zod
- **グローバルトースト通知**: react-hot-toast（操作成功・エラーの通知）
