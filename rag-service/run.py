"""Chạy RAG service: python run.py (cổng đọc từ RAG_PORT trong server/.env, mặc định 18765)."""
import uvicorn

from app.config import RAG_HOST, RAG_PORT

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=RAG_HOST, port=RAG_PORT)
