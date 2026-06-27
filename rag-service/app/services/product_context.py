from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List

from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.services.text_ingest import keyword_score, tokenize


@dataclass
class ProductHit:
    score: float
    content: str


def _as_int(v: Any) -> int:
    try:
        return int(v)
    except Exception:
        return 0


def _like_clause(tokens: List[str], columns: List[str]) -> tuple[str, Dict[str, Any]]:
    toks = [t for t in tokens if len(t) >= 2][:10]
    if not toks:
        return "1=0", {}
    ors = []
    params: Dict[str, Any] = {}
    for i, t in enumerate(toks):
        k = f"t{i}"
        params[k] = f"%{t}%"
        ors.append("(" + " OR ".join([f"{c} LIKE :{k}" for c in columns]) + ")")
    return "(" + " OR ".join(ors) + ")", params


def fetch_product_context(conn: Connection, query: str, limit_scan: int = 120, top_k: int = 6) -> List[Dict[str, Any]]:
    """
    Đọc dữ liệu liên quan sản phẩm từ MySQL (không đụng bảng tài khoản) và tạo ngữ cảnh để LLM trả lời.
    Chiến lược: scan một tập sản phẩm gần đây/đang active và chấm điểm theo keyword.
    """
    q = (query or "").strip()
    if not q:
        return []

    tokens = tokenize(q)
    where, params = _like_clause(
        tokens,
        columns=[
            "p.name",
            "p.slug",
            "p.brand",
            "p.description",
            "c.name",
            "pv.size",
            "pv.color",
        ],
    )

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
              MAX(CASE WHEN pi.is_primary = 1 THEN pi.image_url ELSE NULL END) AS primary_image
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_variants pv ON pv.product_id = p.id
            LEFT JOIN product_images pi ON pi.product_id = p.id
            WHERE p.is_active = 1 AND {where}
            GROUP BY p.id
            ORDER BY p.sold_count DESC, p.created_at DESC
            LIMIT :lim
            """
        ),
        {**params, "lim": limit_scan},
    ).mappings().all()

    hits: List[ProductHit] = []
    for r in rows:
        blob = " | ".join(
            [
                str(r.get("name") or ""),
                str(r.get("brand") or ""),
                str(r.get("category_name") or ""),
                str(r.get("description") or ""),
                str(r.get("sizes") or ""),
                str(r.get("colors") or ""),
                str(r.get("slug") or ""),
            ]
        )
        s = keyword_score(q, blob)
        if s <= 0:
            continue

        price = r.get("price")
        original = r.get("original_price")
        content = (
            f"Sản phẩm: {r.get('name')}\n"
            f"- Danh mục: {r.get('category_name')}\n"
            f"- Thương hiệu: {r.get('brand') or '—'}\n"
            f"- Giá: {price} (giá gốc: {original})\n"
            f"- Size: {r.get('sizes') or '—'}\n"
            f"- Màu: {r.get('colors') or '—'}\n"
            f"- Đã bán: {_as_int(r.get('sold_count'))}\n"
            f"- Slug: {r.get('slug')}\n"
            f"- Ảnh chính: {r.get('primary_image') or '—'}\n"
            f"- Mô tả: {(r.get('description') or '').strip()[:600]}"
        )
        hits.append(ProductHit(score=float(s), content=content))

    hits.sort(key=lambda x: x.score, reverse=True)
    return [
        {"source_label": "Sản phẩm trong DB", "content": h.content, "score": h.score}
        for h in hits[:top_k]
    ]


def fetch_product_context_from_plan(conn: Connection, plan: Dict[str, Any], top_k: int = 8) -> List[Dict[str, Any]]:
    """
    Tìm sản phẩm theo plan JSON do LLM trích xuất, build SQL có tham số (an toàn).
    """
    if not isinstance(plan, dict):
        return []
    keywords = plan.get("keywords") or []
    if isinstance(keywords, str):
        keywords = [keywords]
    keywords = [str(k).strip() for k in keywords if str(k).strip()]

    colors = plan.get("colors") or []
    if isinstance(colors, str):
        colors = [colors]
    colors = [str(c).strip() for c in colors if str(c).strip()]

    sizes = plan.get("sizes") or []
    if isinstance(sizes, str):
        sizes = [sizes]
    sizes = [str(s).strip() for s in sizes if str(s).strip()]

    category = plan.get("category")
    brand = plan.get("brand")

    price_min = plan.get("price_min")
    price_max = plan.get("price_max")
    try:
        price_min = float(price_min) if price_min is not None else None
    except Exception:
        price_min = None
    try:
        price_max = float(price_max) if price_max is not None else None
    except Exception:
        price_max = None

    sort = str(plan.get("sort") or "relevance")
    order_by = "p.sold_count DESC, p.created_at DESC"
    if sort == "price_asc":
        order_by = "p.price ASC"
    elif sort == "price_desc":
        order_by = "p.price DESC"
    elif sort == "newest":
        order_by = "p.created_at DESC"
    elif sort == "best_selling":
        order_by = "p.sold_count DESC"

    where_parts = ["p.is_active = 1"]
    params: Dict[str, Any] = {"lim": int(top_k)}

    if category:
        where_parts.append("c.name LIKE :cat")
        params["cat"] = f"%{str(category).strip()}%"
    if brand:
        where_parts.append("p.brand LIKE :brand")
        params["brand"] = f"%{str(brand).strip()}%"
    if price_min is not None:
        where_parts.append("p.price >= :pmin")
        params["pmin"] = price_min
    if price_max is not None:
        where_parts.append("p.price <= :pmax")
        params["pmax"] = price_max

    # keyword across name/slug/desc/category
    if keywords:
        toks = tokenize(" ".join(keywords))[:10]
        if toks:
            kw_where, kw_params = _like_clause(toks, ["p.name", "p.slug", "p.description", "c.name", "p.brand"])
            where_parts.append(kw_where)
            params.update(kw_params)

    # variant filters
    if colors:
        where_parts.append("(" + " OR ".join([f"pv.color LIKE :col{i}" for i in range(len(colors))]) + ")")
        for i, c in enumerate(colors):
            params[f"col{i}"] = f"%{c}%"
    if sizes:
        where_parts.append("(" + " OR ".join([f"pv.size LIKE :sz{i}" for i in range(len(sizes))]) + ")")
        for i, s in enumerate(sizes):
            params[f"sz{i}"] = f"%{s}%"

    where_sql = " AND ".join(where_parts)

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
              MAX(CASE WHEN pi.is_primary = 1 THEN pi.image_url ELSE NULL END) AS primary_image
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_variants pv ON pv.product_id = p.id
            LEFT JOIN product_images pi ON pi.product_id = p.id
            WHERE {where_sql}
            GROUP BY p.id
            ORDER BY {order_by}
            LIMIT :lim
            """
        ),
        params,
    ).mappings().all()

    hits: List[ProductHit] = []
    q = " ".join(keywords) if keywords else (str(category or "") + " " + str(brand or "")).strip()
    for r in rows:
        blob = " | ".join(
            [
                str(r.get("name") or ""),
                str(r.get("brand") or ""),
                str(r.get("category_name") or ""),
                str(r.get("description") or ""),
                str(r.get("sizes") or ""),
                str(r.get("colors") or ""),
                str(r.get("slug") or ""),
            ]
        )
        s = keyword_score(q or " ", blob)
        price = r.get("price")
        original = r.get("original_price")
        content = (
            f"Sản phẩm: {r.get('name')}\n"
            f"- Danh mục: {r.get('category_name')}\n"
            f"- Thương hiệu: {r.get('brand') or '—'}\n"
            f"- Giá: {price} (giá gốc: {original})\n"
            f"- Size: {r.get('sizes') or '—'}\n"
            f"- Màu: {r.get('colors') or '—'}\n"
            f"- Đã bán: {_as_int(r.get('sold_count'))}\n"
            f"- Slug: {r.get('slug')}\n"
            f"- Ảnh chính: {r.get('primary_image') or '—'}\n"
            f"- Mô tả: {(r.get('description') or '').strip()[:600]}"
        )
        hits.append(ProductHit(score=float(s), content=content))

    hits.sort(key=lambda x: x.score, reverse=True)
    return [
        {"source_label": "Sản phẩm trong DB (LLM query)", "content": h.content, "score": h.score}
        for h in hits[:top_k]
    ]

