import json
from typing import Any, Dict, List, Tuple

import numpy as np
from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.services.text_ingest import chunk_text, keyword_score, bytes_to_plain_text, tokenize
from app.services.embedder import embed_texts, parse_embedding_json


def _like_clause(tokens: List[str], column: str) -> Tuple[str, Dict[str, Any]]:
    """
    Tạo mệnh đề WHERE dạng (col LIKE :t0 OR col LIKE :t1 ...).
    Giới hạn token để tránh query quá nặng.
    """
    toks = [t for t in tokens if len(t) >= 2][:8]
    if not toks:
        return "1=0", {}
    parts = []
    params: Dict[str, Any] = {}
    for i, t in enumerate(toks):
        k = f"t{i}"
        parts.append(f"{column} LIKE :{k}")
        params[k] = f"%{t}%"
    return "(" + " OR ".join(parts) + ")", params


def load_candidate_rows(conn: Connection, session_id: str, query: str, limit_each: int = 160) -> List[Dict[str, Any]]:
    """
    Tối ưu tốc độ: KHÔNG load toàn bộ rag_chunks.
    Chỉ lấy các chunk có content match theo keyword (LIKE) rồi mới chấm điểm.
    """
    tokens = tokenize(query)
    where_admin, p_admin = _like_clause(tokens, "c.content")
    where_sess, p_sess = _like_clause(tokens, "content")

    rows: List[Dict[str, Any]] = []

    admin = conn.execute(
        text(
            f"""
            SELECT c.content, c.embedding, d.title AS source_label
            FROM rag_chunks c
            INNER JOIN rag_documents d ON d.id = c.document_id
            WHERE {where_admin}
            LIMIT :lim
            """
        ),
        {**p_admin, "lim": limit_each},
    ).mappings().all()
    for r in admin:
        rows.append(
            {
                "content": r["content"],
                "embedding": r["embedding"],
                "source_label": r["source_label"] or "Tài liệu cửa hàng",
            }
        )

    sess = conn.execute(
        text(
            f"""
            SELECT content, embedding, original_filename
            FROM rag_session_chunks
            WHERE session_id = :sid AND {where_sess}
            LIMIT :lim
            """
        ),
        {"sid": session_id, **p_sess, "lim": limit_each},
    ).mappings().all()
    for r in sess:
        fn = r["original_filename"] or ""
        label = f"File: {fn}" if fn else "File bạn tải lên"
        rows.append(
            {
                "content": r["content"],
                "embedding": r["embedding"],
                "source_label": label,
            }
        )

    return rows


def score_and_pick(message: str, rows: List[Dict[str, Any]], top_k: int = 6) -> List[Dict[str, Any]]:
    if not rows:
        return []

    q_vec = embed_texts([message.strip()], mode="query")[0]
    scored: List[Tuple[float, Dict[str, Any]]] = []

    for row in rows:
        content = row["content"]
        emb = parse_embedding_json(row.get("embedding"))
        if emb is not None and emb.shape == q_vec.shape:
            s = float(np.dot(q_vec, emb))
        else:
            s = keyword_score(message, content) * 0.99
        scored.append((s, row))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [{**row, "score": float(s)} for s, row in scored[:top_k] if s > 0]


def ingest_plain_text(
    conn: Connection,
    *,
    title: str,
    original_filename: str,
    mime_type: str | None,
    text_body: str,
    uploaded_by: int | None,
    session_id: str | None,
) -> Dict[str, Any]:
    parts = chunk_text(text_body)
    if not parts:
        raise ValueError("Không đọc được nội dung văn bản từ file")

    vectors = embed_texts(parts, mode="document")
    emb_jsons = [json.dumps(v.tolist()) for v in vectors]

    if session_id:
        for i, content in enumerate(parts):
            conn.execute(
                text(
                    """
                    INSERT INTO rag_session_chunks (session_id, content, embedding, original_filename, created_at)
                    VALUES (:sid, :content, :emb, :ofn, NOW(6))
                    """
                ),
                {
                    "sid": session_id,
                    "content": content,
                    "emb": emb_jsons[i],
                    "ofn": original_filename,
                },
            )
        return {"chunk_count": len(parts), "session": True}

    conn.execute(
        text(
            """
            INSERT INTO rag_documents (title, original_filename, mime_type, chunk_count, uploaded_by, created_at, updated_at)
            VALUES (:title, :ofn, :mime, :cnt, :uid, NOW(6), NOW(6))
            """
        ),
        {
            "title": title or original_filename,
            "ofn": original_filename,
            "mime": mime_type,
            "cnt": len(parts),
            "uid": uploaded_by,
        },
    )
    doc_id = conn.execute(text("SELECT LAST_INSERT_ID() AS id")).scalar()
    for i, content in enumerate(parts):
        conn.execute(
            text(
                """
                INSERT INTO rag_chunks (document_id, chunk_index, content, embedding, created_at)
                VALUES (:did, :idx, :content, :emb, NOW(6))
                """
            ),
            {
                "did": doc_id,
                "idx": i,
                "content": content,
                "emb": emb_jsons[i],
            },
        )

    return {
        "chunk_count": len(parts),
        "document": {
            "id": doc_id,
            "title": title or original_filename,
            "original_filename": original_filename,
            "chunk_count": len(parts),
        },
    }


def extract_and_ingest_file(
    conn: Connection,
    data: bytes,
    filename: str,
    content_type: str | None,
    **kwargs: Any,
) -> Dict[str, Any]:
    plain = bytes_to_plain_text(data, filename, content_type)
    return ingest_plain_text(
        conn,
        title=kwargs.get("title") or filename,
        original_filename=filename,
        mime_type=content_type,
        text_body=plain,
        uploaded_by=kwargs.get("uploaded_by"),
        session_id=kwargs.get("session_id"),
    )
