import json
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import OperationalError


def get_or_create_session(conn: Connection, public_key: str, user_id: Optional[int]) -> int:
    row = conn.execute(
        text("SELECT id FROM rag_chat_sessions WHERE public_session_key = :k LIMIT 1"),
        {"k": public_key},
    ).first()
    if row:
        sid = int(row[0])
        if user_id:
            conn.execute(
                text(
                    "UPDATE rag_chat_sessions SET user_id = COALESCE(user_id, :uid), updated_at = NOW(6) WHERE id = :sid"
                ),
                {"uid": user_id, "sid": sid},
            )
        return sid
    conn.execute(
        text(
            """
            INSERT INTO rag_chat_sessions (public_session_key, user_id, created_at, updated_at)
            VALUES (:k, :uid, NOW(6), NOW(6))
            """
        ),
        {"k": public_key, "uid": user_id},
    )
    new_id = conn.execute(text("SELECT LAST_INSERT_ID() AS id")).scalar()
    return int(new_id)


def get_context(conn: Connection, chat_session_id: int) -> Dict[str, Any]:
    """
    Tương thích ngược: nếu DB chưa có cột context_json thì trả {} (không crash).
    """
    try:
        row = conn.execute(
            text("SELECT context_json FROM rag_chat_sessions WHERE id = :sid LIMIT 1"),
            {"sid": chat_session_id},
        ).first()
    except OperationalError:
        return {}

    raw = row[0] if row else None
    if not raw:
        return {}
    try:
        obj = json.loads(raw)
        return obj if isinstance(obj, dict) else {}
    except Exception:
        return {}


def set_context(conn: Connection, chat_session_id: int, ctx: Dict[str, Any]) -> None:
    """
    Tương thích ngược: nếu DB chưa migrate context_json thì bỏ qua.
    """
    raw = json.dumps(ctx or {}, ensure_ascii=False)
    try:
        conn.execute(
            text("UPDATE rag_chat_sessions SET context_json = :c, updated_at = NOW(6) WHERE id = :sid"),
            {"c": raw, "sid": chat_session_id},
        )
    except OperationalError:
        return


def load_history_tail(conn: Connection, chat_session_id: int, limit: int = 12) -> List[Tuple[str, str]]:
    rows = conn.execute(
        text(
            """
            SELECT role, content FROM rag_chat_messages
            WHERE chat_session_id = :sid
            ORDER BY created_at DESC
            LIMIT :lim
            """
        ),
        {"sid": chat_session_id, "lim": limit},
    ).all()
    pairs = [(str(r[0]), str(r[1])) for r in reversed(rows)]
    return pairs


def insert_message(
    conn: Connection,
    chat_session_id: int,
    role: str,
    content: str,
    sources: Optional[List[Dict[str, Any]]] = None,
) -> None:
    sj = json.dumps(sources, ensure_ascii=False) if sources is not None else None
    conn.execute(
        text(
            """
            INSERT INTO rag_chat_messages (chat_session_id, role, content, sources_json, created_at)
            VALUES (:sid, :role, :content, :src, NOW(6))
            """
        ),
        {"sid": chat_session_id, "role": role, "content": content, "src": sj},
    )
