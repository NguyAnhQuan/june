import os
from pathlib import Path
from dotenv import load_dotenv

_app_dir = Path(__file__).resolve().parent
_rag_root = _app_dir.parent
_project_root = _rag_root.parent
load_dotenv(_rag_root / ".env")
load_dotenv(_project_root / "server" / ".env")

RAG_INTERNAL_SECRET = os.getenv("RAG_INTERNAL_SECRET", "dev-rag-secret-doi-trong-production")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "")
DB_USER = os.getenv("DB_USER", "")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")

# Gemini (Google)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-001")
GEMINI_EMBED_DIMENSION = int(os.getenv("GEMINI_EMBED_DIMENSION", "768"))

RAG_HOST = os.getenv("RAG_HOST", "127.0.0.1")
RAG_PORT = int(os.getenv("RAG_PORT", "18765"))

MAX_FILE_BYTES = 8 * 1024 * 1024
