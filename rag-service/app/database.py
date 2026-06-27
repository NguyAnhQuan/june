from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from app.config import DB_HOST, DB_NAME, DB_USER, DB_PASSWORD


def get_engine() -> Engine:
    if not DB_NAME or not DB_USER:
        raise RuntimeError("Thiếu DB_NAME hoặc DB_USER trong .env")
    url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}?charset=utf8mb4"
    return create_engine(url, pool_pre_ping=True, pool_recycle=3600)
