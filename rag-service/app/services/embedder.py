import json
from typing import List, Literal, Optional

import numpy as np

from app.config import GEMINI_API_KEY, GEMINI_EMBED_DIMENSION, GEMINI_EMBED_MODEL

_client = None
_BATCH_SIZE = 32


def _get_client():
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY bắt buộc để tạo embedding (đặt trong server/.env)"
            )
        from google import genai

        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def _normalize_rows(matrix: np.ndarray) -> np.ndarray:
    if matrix.size == 0:
        return matrix
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    return matrix / np.maximum(norms, 1e-12)


def _embed_batch(texts: List[str], *, mode: Literal["query", "document"]) -> np.ndarray:
    from google.genai import types

    task_type = "RETRIEVAL_QUERY" if mode == "query" else "RETRIEVAL_DOCUMENT"
    client = _get_client()
    resp = client.models.embed_content(
        model=GEMINI_EMBED_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=GEMINI_EMBED_DIMENSION,
        ),
    )
    embeddings = getattr(resp, "embeddings", None) or []
    rows: List[np.ndarray] = []
    for emb in embeddings:
        values = getattr(emb, "values", None) or emb
        rows.append(np.array(values, dtype=np.float32))
    if not rows:
        return np.array([])
    return _normalize_rows(np.vstack(rows))


def embed_texts(
    texts: List[str],
    *,
    mode: Literal["query", "document"] = "document",
) -> np.ndarray:
    """Tạo embedding qua Gemini API. mode=query cho câu hỏi, document cho nội dung lưu trữ."""
    cleaned = [(t or "").strip() or " " for t in texts]
    if not cleaned:
        return np.array([])

    chunks: List[np.ndarray] = []
    for i in range(0, len(cleaned), _BATCH_SIZE):
        batch = cleaned[i : i + _BATCH_SIZE]
        chunks.append(_embed_batch(batch, mode=mode))

    return np.vstack(chunks) if chunks else np.array([])


def parse_embedding_json(raw: Optional[str]) -> Optional[np.ndarray]:
    if not raw:
        return None
    try:
        v = json.loads(raw)
        if isinstance(v, list) and v:
            arr = np.array([float(x) for x in v], dtype=np.float32)
            norm = np.linalg.norm(arr)
            if norm > 0:
                arr = arr / norm
            return arr
    except (json.JSONDecodeError, ValueError, TypeError):
        pass
    return None


def cosine_sim_query_matrix(q: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    """q, matrix rows đã L2-normalize thì dot = cosine."""
    if matrix.size == 0:
        return np.array([])
    q = q / (np.linalg.norm(q) + 1e-12)
    m = matrix / (np.linalg.norm(matrix, axis=1, keepdims=True) + 1e-12)
    return m @ q
