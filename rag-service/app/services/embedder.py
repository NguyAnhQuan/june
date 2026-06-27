import json
from typing import List, Optional

import numpy as np
from app.config import EMBED_MODEL_NAME

_model = None


def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(EMBED_MODEL_NAME)
    return _model


def embed_texts(texts: List[str]) -> np.ndarray:
    if not texts:
        return np.array([])
    model = get_model()
    return model.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=False,
        normalize_embeddings=True,
    )


def parse_embedding_json(raw: Optional[str]) -> Optional[np.ndarray]:
    if not raw:
        return None
    try:
        v = json.loads(raw)
        if isinstance(v, list) and v:
            return np.array([float(x) for x in v], dtype=np.float32)
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
