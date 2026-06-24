# ビジネスロジックモデル

## 1. 認証フロー

### 1.1 ログイン
```
入力: username, password
  |
  +-> UserRepository.get_by_username(username)
  |     存在しない → 401 "ユーザー名またはパスワードが正しくありません"
  |
  +-> security.verify_password(password, user.hashed_password)
  |     不一致 → 401 "ユーザー名またはパスワードが正しくありません"
  |     (ユーザー名と区別しない — 列挙攻撃対策)
  |
  +-> security.create_access_token(user.id, user.username)
  |
出力: { access_token, token_type: "bearer" }
```

### 1.2 ユーザー登録
```
入力: username, display_name, password
  |
  +-> バリデーション (username形式, password長)
  |
  +-> UserRepository.get_by_username(username)
  |     存在する → 400 "このユーザー名は既に使用されています"
  |
  +-> security.hash_password(password)
  |
  +-> UserRepository.create(username, display_name, hashed_password)
  |
出力: UserResponse
```

---

## 2. 書籍管理フロー

### 2.1 書籍一覧取得
```
入力: keyword?, category_id?, page=1, size=20
  |
  +-> クエリ構築:
  |     keyword → title ILIKE / author ILIKE / isbn ILIKE (OR条件)
  |     category_id → category_id = ?
  |
  +-> BookRepository.get_list(filters, skip, limit)
  |
  +-> 各書籍に is_borrowed フラグを付与
  |     (LoanRecordにreturn_date IS NULLのレコードが存在するか)
  |
出力: BookListResponse { items, total, page, size }
```

### 2.2 書籍詳細取得
```
入力: book_id
  |
  +-> BookRepository.get_by_id(book_id)
  |     存在しない → 404 "書籍が見つかりません"
  |
  +-> LoanRepository.get_active_loan(book_id)  # 現在の貸出情報
  |
  +-> LoanRepository.get_history(book_id)      # 貸出履歴全件
  |
出力: BookDetailResponse
```

### 2.3 書籍登録
```
入力: BookCreate
  |
  +-> バリデーション (title必須, published_year範囲)
  |
  +-> ISBNが指定されている場合:
  |     BookRepository.get_by_isbn(isbn)
  |     存在する → レスポンスに isbn_duplicate: true を付与（登録は続行）
  |
  +-> BookRepository.create(data)
  |
出力: BookResponse (+ isbn_duplicate フラグ)
```

### 2.4 書籍削除
```
入力: book_id
  |
  +-> BookRepository.get_by_id(book_id)
  |     存在しない → 404
  |
  +-> LoanRepository.get_active_loan(book_id)
  |     貸出中レコードあり → 400 "貸出中の書籍は削除できません"
  |
  +-> BookRepository.delete(book_id)
  |
出力: 204 No Content
```

---

## 3. カテゴリ管理フロー

### 3.1 カテゴリ削除
```
入力: category_id
  |
  +-> CategoryRepository.get_by_id(category_id)
  |     存在しない → 404
  |
  +-> BookRepository.count_by_category(category_id)
  |     1件以上 → 400 "このカテゴリには書籍が登録されています。
  |                     先に書籍のカテゴリを変更してください"
  |
  +-> CategoryRepository.delete(category_id)
  |
出力: 204 No Content
```

---

## 4. 貸出・返却フロー

### 4.1 貸出申請
```
入力: book_id, current_user (JWTから取得)
  |
  +-> BookRepository.get_by_id(book_id)
  |     存在しない → 404
  |
  +-> LoanRepository.get_active_loan(book_id)
  |     貸出中レコードあり → 400 "この書籍は現在貸出中です"
  |
  +-> LoanRepository.create(book_id, user_id, loan_date=today)
  |
出力: LoanResponse
```

### 4.2 返却処理
```
入力: loan_id
  |
  +-> LoanRepository.get_by_id(loan_id)
  |     存在しない → 404
  |
  +-> loan.return_date IS NOT NULL → 400 "既に返却済みです"
  |
  +-> LoanRepository.update_return_date(loan_id, return_date=today)
  |
出力: LoanResponse
```

---

## 5. インポートフロー

### 5.1 CSV/Excelインポート
```
入力: UploadFile (CSV or Excel)
  |
  +-> ファイル形式判定:
  |     .csv → csv.reader で解析
  |     .xlsx / .xls → openpyxl で解析
  |     その他 → 400 "CSV または Excel ファイルをアップロードしてください"
  |
  +-> ヘッダー行を検出（1行目）
  |
  +-> 各データ行を処理:
  |     title が空 → skipped +1、次の行へ
  |     ISBN重複チェック → 重複あり → skipped +1、次の行へ
  |     バリデーション失敗 → errors に追加、次の行へ
  |     正常 → BookRepository.create() → success +1
  |
出力: ImportResult { success, skipped, errors }
```

---

## 6. JWT認証ミドルウェアフロー

```
全認証必要エンドポイントへのリクエスト
  |
  +-> Authorization ヘッダーの存在確認
  |     なし → 401 "認証が必要です"
  |
  +-> "Bearer " プレフィックスの確認
  |
  +-> security.decode_access_token(token)
  |     期限切れ → 401 "セッションが期限切れです"
  |     不正トークン → 401 "無効なトークンです"
  |
  +-> UserRepository.get_by_id(user_id from token)
  |     ユーザー削除済み → 401
  |
  +-> request.state.current_user = user
```
