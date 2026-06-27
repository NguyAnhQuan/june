from __future__ import annotations

from typing import Any, Dict, List


def responseFormatter_products(rows: List[Dict[str, Any]]) -> str:
    if not rows:
        return ""
    lines: List[str] = []
    if len(rows) == 1:
        r = rows[0]
        lines.append(f"Về **{r.get('name')}**:")
        lines.append(f"- **Giá**: {r.get('price')} (giá gốc: {r.get('original_price')})")
        if r.get("sizes"):
            lines.append(f"- **Size**: {r.get('sizes')}")
        if r.get("colors"):
            lines.append(f"- **Màu**: {r.get('colors')}")
        if r.get("category_name"):
            lines.append(f"- **Danh mục**: {r.get('category_name')}")
        if r.get("brand"):
            lines.append(f"- **Thương hiệu**: {r.get('brand')}")
        if r.get("description"):
            desc = str(r.get("description") or "").strip()
            if desc:
                lines.append(f"- **Mô tả**: {desc[:450]}{'…' if len(desc) > 450 else ''}")
        if r.get("slug"):
            lines.append(f"- **Link**: `/product/{r.get('slug')}`")
        return "\n".join(lines)

    lines.append("Mình tìm thấy một số sản phẩm phù hợp:")
    for i, r in enumerate(rows[:6], 1):
        name = r.get("name")
        price = r.get("price")
        slug = r.get("slug")
        cat = r.get("category_name") or "—"
        lines.append(f"{i}) **{name}** — {price} — {cat} — `/product/{slug}`")
    lines.append("Bạn muốn mình tư vấn kỹ sản phẩm số mấy?")
    return "\n".join(lines)


def formatResponse_products_ranked(ranked: List[Any]) -> str:
    """
    ranked: list[RankedProduct] (duck-typed: has .row and .score)
    """
    if not ranked:
        return ""
    if len(ranked) == 1:
        return responseFormatter_products([ranked[0].row])

    lines: List[str] = ["Mình tìm thấy sản phẩm phù hợp:"]
    for i, item in enumerate(ranked[:5], 1):
        r = item.row
        lines.append(
            f"{i}) **{r.get('name')}** — {r.get('price')} — `/product/{r.get('slug')}`"
        )
    lines.append("Bạn muốn mình tư vấn kỹ sản phẩm số mấy?")
    return "\n".join(lines)

