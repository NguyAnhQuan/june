from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass
from typing import Literal, Optional

from app.config import GEMINI_API_KEY, GEMINI_MODEL

Intent = Literal["PRODUCT_QUERY", "FAQ_QUERY", "PROMOTION_QUERY", "OTHER"]


@dataclass
class IntentResult:
    intent: Intent
    confidence: float
    reason: str = ""


def _heuristic_intent(message: str) -> IntentResult:
    m = (message or "").strip().lower()
    if not m:
        return IntentResult(intent="OTHER", confidence=0.9, reason="empty")

    faq = [
        "phí giao hàng",
        "phi giao hang",
        "giao hàng",
        "giao hang",
        "ship",
        "vận chuyển",
        "van chuyen",
        "đổi trả",
        "doi tra",
        "bảo hành",
        "bao hanh",
        "chính sách",
        "chinh sach",
        "thanh toán",
        "thanh toan",
        "vnpay",
        "hoàn tiền",
        "hoan tien",
    ]
    if any(k in m for k in faq):
        return IntentResult(intent="FAQ_QUERY", confidence=0.75, reason="faq keyword")

    promo = ["flash sale", "flash", "sale", "giảm", "giam", "khuyến mãi", "khuyen mai", "cuối năm", "cuoi nam"]
    if any(k in m for k in promo):
        return IntentResult(intent="PROMOTION_QUERY", confidence=0.75, reason="promo keyword")

    prod = [
        "sản phẩm",
        "san pham",
        "/product/",
        "áo",
        "ao",
        "quần",
        "quan",
        "váy",
        "vay",
        "polo",
        "hoodie",
        "jean",
        "size",
        "màu",
        "mau",
        "giá",
        "gia",
        "còn hàng",
        "con hang",
        "tồn kho",
        "ton kho",
        "gợi ý",
        "goi y",
    ]
    if any(k in m for k in prod):
        # tránh nhầm chữ "hàng" trong "giao hàng" => FAQ
        if "giao hàng" in m or "giao hang" in m:
            return IntentResult(intent="FAQ_QUERY", confidence=0.75, reason="shipping policy")
        return IntentResult(intent="PRODUCT_QUERY", confidence=0.7, reason="product keyword")

    return IntentResult(intent="OTHER", confidence=0.55, reason="default")


async def intent_classifier(message: str) -> IntentResult:
    """
    Intent classification step trước retrieval.
    Nếu có GEMINI_API_KEY: dùng Gemini trả JSON; nếu không: heuristic.
    """
    if not GEMINI_API_KEY:
        return _heuristic_intent(message)

    def _call() -> IntentResult:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = (
            "Classify user question for an e-commerce fashion website (June).\n"
            "Return ONLY a JSON object, no markdown:\n"
            '{\"intent\":\"PRODUCT_QUERY\"|\"FAQ_QUERY\"|\"PROMOTION_QUERY\"|\"OTHER\",\"confidence\":0-1,\"reason\":\"...\"}\n'
            "Definitions:\n"
            "- PRODUCT_QUERY: products (price, size, color, availability, category, recommendations)\n"
            "- FAQ_QUERY: policies/shipping/returns/general info\n"
            "- PROMOTION_QUERY: promotions/flash sale/coupons/banners\n"
            "- OTHER: smalltalk or unrelated\n\n"
            f"Question: {message}"
        )
        resp = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.0),
        )
        text = (getattr(resp, "text", "") or "").strip()
        if not text:
            return _heuristic_intent(message)
        try:
            obj = json.loads(text)
        except Exception:
            s = text.find("{")
            e = text.rfind("}")
            if s >= 0 and e > s:
                try:
                    obj = json.loads(text[s : e + 1])
                except Exception:
                    return _heuristic_intent(message)
            else:
                return _heuristic_intent(message)

        intent = obj.get("intent")
        conf = float(obj.get("confidence") or 0.0)
        reason = str(obj.get("reason") or "")
        if intent not in ("PRODUCT_QUERY", "FAQ_QUERY", "PROMOTION_QUERY", "OTHER"):
            return _heuristic_intent(message)
        conf = max(0.0, min(1.0, conf))
        return IntentResult(intent=intent, confidence=conf, reason=reason)

    try:
        return await asyncio.to_thread(_call)
    except Exception:
        return _heuristic_intent(message)

