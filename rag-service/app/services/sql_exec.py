from __future__ import annotations

import re
from typing import Any, Dict, List

from sqlalchemy import text
from sqlalchemy.engine import Connection


_BAD_SQL = re.compile(r";|--|/\*|\b(insert|update|delete|drop|alter|create|grant|revoke|truncate)\b", re.IGNORECASE)


def validate_select_sql(sql: str) -> None:
    s = (sql or "").strip()
    if not s:
        raise ValueError("Empty SQL")
    if not s.lower().startswith("select"):
        raise ValueError("Only SELECT queries are allowed")
    if _BAD_SQL.search(s):
        raise ValueError("Disallowed SQL tokens")


def queryDatabase(conn: Connection, sql: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
    validate_select_sql(sql)
    rows = conn.execute(text(sql), params or {}).mappings().all()
    return [dict(r) for r in rows]

