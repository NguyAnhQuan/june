from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import text
from sqlalchemy.engine import Connection


def handleShipping(*, ctx_location: str, ctx_order_value: Optional[int]) -> str:
    """
    Fallback ước tính phí ship khi RAG thiếu dữ liệu cụ thể.
    """
    loc = (ctx_location or "").strip()
    ov = ctx_order_value

    # Free ship threshold theo mẫu tài liệu (nếu đúng)
    if ov is not None and ov >= 500_000:
        return "Đơn từ **500.000đ** thường được **miễn phí giao hàng tiêu chuẩn**. Bạn xác nhận giúp mình tổng đơn cuối cùng để mình tư vấn chắc hơn nhé."

    if loc in ("Hà Nội", "TP. Hồ Chí Minh"):
        base = "khoảng **20.000–30.000đ**"
    else:
        base = "khoảng **30.000–50.000đ**"

    extra = []
    if ov is not None:
        extra.append(f"Đơn của bạn: **{ov:,}đ**".replace(",", "."))
    if loc:
        extra.append(f"Khu vực: **{loc}**")

    head = "Phí ship tham khảo"
    if extra:
        head += " (" + " · ".join(extra) + ")"
    return (
        f"{head}: {base} (tùy đơn vị vận chuyển và khối lượng).\n"
        "Nếu bạn gửi giúp mình **quận/huyện** và **cân nặng ước tính** (hoặc số lượng sản phẩm) mình sẽ ước tính sát hơn."
    )


def _query_like(conn: Connection, table: str, fields: List[str], keyword: str, limit: int = 5) -> List[Dict[str, Any]]:
    kw = (keyword or "").strip()
    if not kw:
        return []
    ors = " OR ".join([f"{f} LIKE :kw" for f in fields])
    sql = f"SELECT * FROM {table} WHERE ({ors}) ORDER BY id DESC LIMIT :lim"
    rows = conn.execute(text(sql), {"kw": f"%{kw}%", "lim": int(limit)}).mappings().all()
    return [dict(r) for r in rows]


def handlePromotion(conn: Connection, message: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Ưu tiên lấy dữ liệu thực trong DB (banners/coupons/posts).
    Nếu không có => trả rõ 'chưa có dữ liệu'.
    """
    m = (message or "").strip()
    # banners: title/link/is_active
    banners = conn.execute(
        text(
            """
            SELECT id, title, link, position, is_active, created_at
            FROM banners
            WHERE is_active = 1
            ORDER BY position ASC, created_at DESC
            LIMIT 8
            """
        )
    ).mappings().all()
    banners = [dict(r) for r in banners]

    # nếu user có keyword cụ thể, lọc lại bằng LIKE
    kw = None
    for k in ["flash", "sale", "cuối năm", "cuoi nam", "giảm", "giam"]:
        if k in m.lower():
            kw = k
            break
    if kw:
        banners2 = _query_like(conn, "banners", ["title", "link"], kw, limit=6)
        if banners2:
            banners = banners2

    if banners:
        lines = ["Hiện hệ thống đang có các banner/CTKM:"]
        for i, b in enumerate(banners[:6], 1):
            title = b.get("title")
            link = b.get("link") or ""
            lines.append(f"{i}) **{title}** — {link if link else '(không có link)'}")
        return "\n".join(lines), [{"title": "DB: banners", "preview": banners[0].get("title", "")}]

    # coupons (nếu có)
    coupons = conn.execute(
        text(
            """
            SELECT id, code, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, is_active
            FROM coupons
            WHERE is_active = 1
            ORDER BY created_at DESC
            LIMIT 8
            """
        )
    ).mappings().all()
    coupons = [dict(r) for r in coupons]
    if coupons:
        lines = ["Hiện hệ thống có các mã giảm giá:"]
        for i, c in enumerate(coupons[:6], 1):
            lines.append(f"{i}) **{c.get('code')}** — {c.get('discount_type')} {c.get('discount_value')}")
        return "\n".join(lines), [{"title": "DB: coupons", "preview": coupons[0].get("code", "")}]

    return (
        "Hiện hệ thống **chưa có dữ liệu** về chương trình khuyến mãi/flash sale cho nội dung bạn hỏi. "
        "Bạn có thể vào trang sản phẩm hoặc banner trang chủ để xem CTKM đang chạy.",
        [],
    )

