from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, URL
from app.config import DB_HOST, DB_NAME, DB_USER, DB_PASSWORD


def get_engine() -> Engine:
    if not DB_NAME or not DB_USER:
        raise RuntimeError("Thiếu DB_NAME hoặc DB_USER trong .env")
    url = URL.create(
        drivername="mysql+pymysql",
        username=DB_USER,
        password=DB_PASSWORD or "",
        host=DB_HOST,
        database=DB_NAME,
        query={"charset": "utf8mb4"},
    )
    return create_engine(url, pool_pre_ping=True, pool_recycle=3600)
