from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from sqlalchemy.engine import Connection

from app.services import rag_pipeline


@dataclass
class VectorSearchResult:
    hits: List[Dict[str, Any]]
    max_score: float


def vectorSearch(
    conn: Connection,
    session_id: str,
    message: str,
    *,
    top_k: int = 6,
    candidate_limit: int = 180,
    similarity_threshold: float = 0.7,
) -> VectorSearchResult:
    """
    RAG search with confidence control.
    score_and_pick() trả cosine (0..1) nếu có embedding; nếu không sẽ là keyword_score * 0.99.
    Ở đây áp dụng threshold 0.7 để tránh trả lời từ RAG khi không đủ tự tin.
    """
    rows = rag_pipeline.load_candidate_rows(conn, session_id, message, limit_each=candidate_limit)
    hits = rag_pipeline.score_and_pick(message, list(rows), top_k=top_k)
    max_score = float(hits[0]["score"]) if hits else 0.0

    # Nếu dưới threshold thì coi như không có hit
    if max_score < similarity_threshold:
        return VectorSearchResult(hits=[], max_score=max_score)
    return VectorSearchResult(hits=hits, max_score=max_score)

