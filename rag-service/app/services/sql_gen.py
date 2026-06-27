from __future__ import annotations

from typing import Any, Dict, Tuple

from sqlalchemy import text

from app.services.answer import llm_extract_db_search
from app.services.text_ingest import tokenize


PRODUCT_SCHEMA_HINT = (
    "Schema (read-only):\n"
    "- products(id, name, slug, description, price, original_price, category_id, brand, is_active, sold_count, created_at)\n"
    "- categories(id, name, slug)\n"
    "- product_variants(product_id, size, color, stock)\n"
    "- product_images(product_id, image_url, is_primary)\n"
)


def _safe_sort(sort: str) -> str:
    s = (sort or "relevance").strip()
    if s == "price_asc":
        return "p.price ASC"
    if s == "price_desc":
        return "p.price DESC"
    if s == "best_selling":
        return "p.sold_count DESC"
    if s == "newest":
        return "p.created_at DESC"
    return "p.sold_count DESC, p.created_at DESC"


async def generateSQL(user_message: str, limit: int = 8) -> Tuple[str, Dict[str, Any]]:
    """
    Generate SQL by LLM (indirectly): LLM -> plan(JSON), then we build parameterized SELECT SQL.
    Only SELECT allowed, safe params.
    """
    plan = await llm_extract_db_search(user_message) or {}

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
    sort = str(plan.get("sort") or "relevance")

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

    where_parts = ["p.is_active = 1"]
    params: Dict[str, Any] = {"lim": int(limit)}

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

    if keywords:
        toks = tokenize(" ".join(keywords))[:10]
        if toks:
            ors = []
            for i, t in enumerate(toks):
                k = f"kw{i}"
                params[k] = f"%{t}%"
                ors.append("(p.name LIKE :{k} OR p.slug LIKE :{k} OR p.description LIKE :{k} OR c.name LIKE :{k} OR p.brand LIKE :{k})".format(k=k))
            where_parts.append("(" + " OR ".join(ors) + ")")

    if colors:
        sub = []
        for i, c in enumerate(colors[:6]):
            k = f"col{i}"
            params[k] = f"%{c}%"
            sub.append(f"pv.color LIKE :{k}")
        where_parts.append("(" + " OR ".join(sub) + ")")

    if sizes:
        sub = []
        for i, s in enumerate(sizes[:6]):
            k = f"sz{i}"
            params[k] = f"%{s}%"
            sub.append(f"pv.size LIKE :{k}")
        where_parts.append("(" + " OR ".join(sub) + ")")

    where_sql = " AND ".join(where_parts)
    order_by = _safe_sort(sort)

    sql = f"""
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
    """.strip()

    # Ensure it's a SELECT statement (hard guarantee)
    sql = " ".join(sql.split())
    if not sql.lower().startswith("select"):
        raise ValueError("Only SELECT is allowed")
    return sql, params

