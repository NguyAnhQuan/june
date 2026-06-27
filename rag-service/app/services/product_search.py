from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import numpy as np
from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.services.embedder import embed_texts, cosine_sim_query_matrix
from app.services.keyword_extractor import KeywordPlan
from app.services.text_ingest import keyword_score


@dataclass
class RankedProduct:
    row: Dict[str, Any]
    score: float


def _build_where(plan: KeywordPlan) -> tuple[str, Dict[str, Any]]:
    where_parts = ["p.is_active = 1"]
    params: Dict[str, Any] = {}

    # strict category filter if product_type present
    if plan.product_type:
        where_parts.append("c.name LIKE :cat")
        params["cat"] = f"%{plan.product_type}%"

    # strict must_terms filter: require at least one in name/slug
    if plan.must_terms:
        ors = []
        for i, t in enumerate(plan.must_terms[:4]):
            k = f"m{i}"
            params[k] = f"%{t}%"
            ors.append(f"(p.name LIKE :{k} OR p.slug LIKE :{k})")
        where_parts.append("(" + " OR ".join(ors) + ")")

    # optional attributes: size/color
    if plan.colors:
        ors = []
        for i, c in enumerate(plan.colors[:6]):
            k = f"col{i}"
            params[k] = f"%{c}%"
            ors.append(f"pv.color LIKE :{k}")
        where_parts.append("(" + " OR ".join(ors) + ")")

    if plan.sizes:
        ors = []
        for i, s in enumerate(plan.sizes[:6]):
            k = f"sz{i}"
            params[k] = f"%{s}%"
            ors.append(f"pv.size LIKE :{k}")
        where_parts.append("(" + " OR ".join(ors) + ")")

    return " AND ".join(where_parts), params


def searchProducts(conn: Connection, plan: KeywordPlan, limit: int = 80) -> List[Dict[str, Any]]:
    where_sql, params = _build_where(plan)
    params["lim"] = int(limit)

    rows = conn.execute(
        text(
            f"""
            SELECT
              p.id,
              p.name,
              p.slug,
              p.price,
              p.original_price,
              p.brand,
              p.description,
              p.sold_count,
              c.name AS category_name,
              GROUP_CONCAT(DISTINCT pv.size ORDER BY pv.size SEPARATOR ', ') AS sizes,
              GROUP_CONCAT(DISTINCT pv.color ORDER BY pv.color SEPARATOR ', ') AS colors,
              SUM(COALESCE(pv.stock,0)) AS total_stock,
              MAX(CASE WHEN pi.is_primary = 1 THEN pi.image_url ELSE NULL END) AS primary_image
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_variants pv ON pv.product_id = p.id
            LEFT JOIN product_images pi ON pi.product_id = p.id
            WHERE {where_sql}
            GROUP BY p.id
            ORDER BY p.sold_count DESC, p.created_at DESC
            LIMIT :lim
            """
        ),
        params,
    ).mappings().all()
    return [dict(r) for r in rows]


def rankProducts(query: str, rows: List[Dict[str, Any]], plan: KeywordPlan, top_k: int = 5) -> List[RankedProduct]:
    if not rows:
        return []

    # Build candidate texts for embedding ranking
    texts = []
    for r in rows:
        texts.append(
            " | ".join(
                [
                    str(r.get("name") or ""),
                    str(r.get("category_name") or ""),
                    str(r.get("brand") or ""),
                    str(r.get("description") or ""),
                    str(r.get("sizes") or ""),
                    str(r.get("colors") or ""),
                    str(r.get("slug") or ""),
                ]
            )
        )

    q_vec = embed_texts([query.strip()])[0]
    mat = embed_texts(texts)
    sims = cosine_sim_query_matrix(q_vec, mat)  # 0..1

    # Keyword score (strict): name/slug/category must match more
    combined: List[RankedProduct] = []
    for i, r in enumerate(rows):
        kw_blob = " ".join([str(r.get("name") or ""), str(r.get("slug") or ""), str(r.get("category_name") or "")])
        kw = keyword_score(" ".join(plan.must_terms + plan.soft_terms), kw_blob)
        score = float(sims[i]) * 0.75 + float(kw) * 0.35
        combined.append(RankedProduct(row=r, score=score))

    combined.sort(key=lambda x: x.score, reverse=True)

    # Strict filtering: drop low relevance
    out = [x for x in combined if x.score >= 0.45]
    return out[:top_k]

