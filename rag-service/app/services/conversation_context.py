from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class Context:
    last_intent: str = ""
    last_topic: str = ""  # shipping | promotion | product | other
    location: str = ""
    order_value: Optional[int] = None  # VND


def _norm(s: str) -> str:
    return (s or "").strip().lower()


def parse_location(message: str) -> str:
    m = _norm(message)
    if "hà nội" in m or "ha noi" in m:
        return "Hà Nội"
    if "hồ chí minh" in m or "ho chi minh" in m or "tp hcm" in m or "hcm" in m:
        return "TP. Hồ Chí Minh"
    return ""


def parse_order_value(message: str) -> Optional[int]:
    """
    Parse money like:
    - '200k', '200 nghìn', '200' (ngữ cảnh đơn hàng thường hiểu là 200k)
    - '200000', '200.000'
    """
    m = _norm(message).replace(".", "").replace(",", "")
    # 200k
    mk = re.search(r"\b(\d{2,7})\s*k\b", m)
    if mk:
        return int(mk.group(1)) * 1000
    # 200 nghin
    mng = re.search(r"\b(\d{2,7})\s*(nghin|nghìn)\b", m)
    if mng:
        return int(mng.group(1)) * 1000
    # raw number
    mn = re.search(r"\b(\d{2,9})\b", m)
    if not mn:
        return None
    v = int(mn.group(1))
    # heuristic: <= 1000 => interpret as thousand VND
    if v <= 1000:
        return v * 1000
    return v


def load_ctx(raw: Dict[str, Any]) -> Context:
    return Context(
        last_intent=str(raw.get("last_intent") or ""),
        last_topic=str(raw.get("last_topic") or ""),
        location=str(raw.get("location") or ""),
        order_value=int(raw["order_value"]) if raw.get("order_value") is not None else None,
    )


def dump_ctx(ctx: Context) -> Dict[str, Any]:
    out: Dict[str, Any] = {
        "last_intent": ctx.last_intent,
        "last_topic": ctx.last_topic,
        "location": ctx.location,
        "order_value": ctx.order_value,
    }
    return out


def detectFollowUp(message: str, ctx: Context, intent: str) -> bool:
    m = _norm(message)
    if not m:
        return False
    # nếu last_topic=shipping và message chứa location/amount => follow-up
    if ctx.last_topic == "shipping":
        if parse_location(m) or parse_order_value(m) is not None:
            return True
    # nếu last_topic=promotion và message chứa 'cuoi nam/flash sale/sale' => follow-up
    if ctx.last_topic == "promotion":
        if any(k in m for k in ["cuối năm", "cuoi nam", "flash", "sale", "giảm", "giam"]):
            return True
    return False


def mergeContext(message: str, ctx: Context) -> Context:
    loc = parse_location(message)
    if loc:
        ctx.location = loc
    val = parse_order_value(message)
    if val is not None:
        ctx.order_value = val
    return ctx


def updateContext(ctx: Context, intent: str, topic: str) -> Context:
    ctx.last_intent = intent
    ctx.last_topic = topic
    return ctx

