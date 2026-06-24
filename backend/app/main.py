from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, books, categories, loans, import_data, locations

app = FastAPI(title="Book Manager API", version="1.0.0")

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(categories.router)
app.include_router(loans.router)
app.include_router(import_data.router)
app.include_router(locations.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
