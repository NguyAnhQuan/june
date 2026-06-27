import asyncio
import json
import re
from typing import List, Optional, Tuple

from app.config import GEMINI_API_KEY, GEMINI_MODEL, OPENAI_API_KEY, OPENAI_CHAT_MODEL
from app.services.text_ingest import tokenize


SYSTEM_POLICY_VI = (
    "Bạn là trợ lý tư vấn của website bán quần áo June. "
    "CHỈ trả lời các câu hỏi liên quan đến: sản phẩm thời trang của June (giá, size, màu, tồn kho nếu có), "
    "chính sách giao hàng/đổi trả/bảo hành, đặt hàng, thanh toán, khuyến mãi, liên hệ. "
    "Nếu câu hỏi không liên quan đến web June hoặc yêu cầu thông tin ngoài ngữ cảnh, hãy từ chối ngắn gọn "
    "và gợi ý người dùng hỏi lại theo chủ đề của June. "
    "Tuyệt đối không bịa. Nếu ngữ cảnh không đủ, nói 'mình chưa có thông tin trong dữ liệu hiện có'. "
    "Trả lời tiếng Việt, rõ ràng, thân thiện."
)

ANSWER_STYLE = (
    "Cách trả lời:\n"
    "- Trả lời đúng trọng tâm câu hỏi.\n"
    "- Nếu câu hỏi nhắc tới 1 sản phẩm cụ thể: ưu tiên đối chiếu theo 'Sản phẩm trong DB'.\n"
    "- Nếu không tìm thấy sản phẩm/tài liệu khớp: KHÔNG bịa thông tin cụ thể; hãy hỏi lại 1 câu để làm rõ hoặc gợi ý 2-3 hướng.\n"
    "- Không trả lời lan man, không đưa thông tin không liên quan.\n"
)


def is_smalltalk(message: str) -> bool:
    """
    Nhận diện smalltalk theo TỪ (tránh bug 'hi' nằm trong 'ship').
    """
    m = (message or "").strip()
    if not m:
        return True
    toks = tokenize(m)
    if not toks:
        return True

    # greeting thường nằm đầu câu
    first = toks[0]
    greetings = {"chao", "hello", "hi", "alo"}
    if first in greetings:
        return True

    joined = " ".join(toks[:6])
    phrases = [
        "xin chao",
        "ban la ai",
        "ai vay",
        "help",
        "giup",
        "tu van",
    ]
    return any(p in joined for p in phrases)


def smalltalk_reply() -> str:
    return (
        "Chào bạn! Mình là trợ lý tư vấn của June.\n"
        "Bạn muốn hỏi về sản phẩm (giá/size/màu), chính sách giao hàng/đổi trả, hoặc cần gợi ý chọn size không?"
    )


def needs_size_policy(message: str) -> bool:
    m = (message or "").lower()
    keys = ["size", "cỡ", "co", "chọn size", "chon size", "bảng size", "bang size", "vừa", "vua"]
    return any(k in m for k in keys)


def needs_shipping_policy(message: str) -> bool:
    m = (message or "").lower()
    keys = ["ship", "giao", "vận chuyển", "van chuyen", "phí ship", "phi ship", "thời gian giao", "thoi gian giao"]
    return any(k in m for k in keys)


def needs_return_policy(message: str) -> bool:
    m = (message or "").lower()
    keys = ["đổi", "doi", "trả", "tra", "hoàn", "hoan", "bảo hành", "bao hanh"]
    return any(k in m for k in keys)


def has_product_intent(message: str) -> bool:
    """
    Heuristic: câu hỏi đang nhắm tới sản phẩm cụ thể / tìm sản phẩm.
    Tránh nhầm với 'hàng' trong 'giao hàng'.
    """
    m = (message or "").lower()
    if "/product/" in m or "slug" in m:
        return True
    product_words = [
        "sản phẩm",
        "ao ", "áo", "ao-", "áo-",
        "quan", "quần", "vay", "váy",
        "polo", "jean", "hoodie", "sơ mi", "so mi", "thun",
        "màu", "mau", "size", "cỡ", "co",
        "giá", "gia", "còn hàng", "con hang", "tồn kho", "ton kho",
    ]
    if any(w in m for w in product_words):
        # nếu là câu policy vận chuyển thì không coi là product intent chỉ vì có chữ 'hàng'
        if needs_shipping_policy(m) and ("hàng" in m or "hang" in m) and ("áo" not in m and "ao" not in m and "quần" not in m and "quan" not in m):
            return False
        return True
    return False


def build_product_reply_from_block(block: str, user_message: str) -> str | None:
    """
    Tạo câu trả lời chắc chắn từ block 'Sản phẩm: ...' (khi LLM lỗi) để tránh trả lời lạc đề.
    """
    if not block or "Sản phẩm:" not in block:
        return None

    def _pick(prefix: str) -> str:
        m = re.search(rf"^- {re.escape(prefix)}:\s*(.*)$", block, flags=re.MULTILINE)
        return (m.group(1).strip() if m else "")

    name_m = re.search(r"^Sản phẩm:\s*(.+)$", block, flags=re.MULTILINE)
    name = (name_m.group(1).strip() if name_m else "").strip()
    if not name:
        return None

    category = _pick("Danh mục")
    brand = _pick("Thương hiệu")
    price = _pick("Giá")
    sizes = _pick("Size")
    colors = _pick("Màu")
    desc = _pick("Mô tả")
    slug = _pick("Slug")

    parts = [f"Về **{name}**:"]
    if price:
        parts.append(f"- **Giá**: {price}")
    if sizes and needs_size_policy(user_message):
        parts.append(f"- **Size**: {sizes}")
    elif sizes:
        parts.append(f"- **Size**: {sizes}")
    if colors:
        parts.append(f"- **Màu**: {colors}")
    if category:
        parts.append(f"- **Danh mục**: {category}")
    if brand:
        parts.append(f"- **Thương hiệu**: {brand}")
    if desc:
        parts.append(f"- **Mô tả**: {desc}")
    if slug:
        parts.append(f"- **Link**: mở sản phẩm theo đường dẫn `/product/{slug}`")

    parts.append("Bạn muốn mình tư vấn **chọn size** hay **phối đồ** cho sản phẩm này không?")
    return "\n".join(parts)


def build_fallback_reply(user_message: str, context_blocks: List[str]) -> str:
    parts = [
        "Theo tài liệu tham khảo:",
        "",
    ]
    for i, block in enumerate(context_blocks[:5], 1):
        excerpt = block[:500] + ("…" if len(block) > 500 else "")
        parts.append(f"{i}) {excerpt}")
        parts.append("")
    return "\n".join(parts)


async def llm_extract_db_search(message: str) -> dict | None:
    """
    Dùng LLM để trích xuất intent tìm kiếm trong DB (KHÔNG sinh SQL trực tiếp).
    Output JSON an toàn để backend tự build SQL có tham số.
    """
    if not GEMINI_API_KEY:
        return None

    def _call() -> dict | None:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = (
            "Bạn là hệ thống trích xuất truy vấn tìm kiếm cho CSDL MySQL của web bán quần áo June.\n"
            "Nhiệm vụ: đọc câu hỏi và trả về 1 JSON duy nhất (không thêm chữ) với các field:\n"
            "{\n"
            '  "intent": "product_search" | "policy" | "order_payment" | "other",\n'
            '  "keywords": [string],\n'
            '  "category": string | null,\n'
            '  "brand": string | null,\n'
            '  "colors": [string],\n'
            '  "sizes": [string],\n'
            '  "price_min": number | null,\n'
            '  "price_max": number | null,\n'
            '  "sort": "relevance" | "price_asc" | "price_desc" | "best_selling" | "newest"\n'
            "}\n"
            "Quy tắc:\n"
            "- Nếu người dùng hỏi về 1 sản phẩm cụ thể: intent=product_search và keywords chứa tên/slug.\n"
            "- Không bịa. Không trả về SQL.\n"
            "- keywords nên ngắn gọn, bỏ từ dừng kiểu 'cho mình hỏi', 'về', 'có'...\n\n"
            f"Câu hỏi: {message}"
        )

        resp = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.1),
        )
        text = (getattr(resp, "text", "") or "").strip()
        if not text:
            return None
        try:
            return json.loads(text)
        except Exception:
            # cố gắng lấy đoạn JSON nếu model bọc thêm ký tự
            start = text.find("{")
            end = text.rfind("}")
            if start >= 0 and end > start:
                try:
                    return json.loads(text[start : end + 1])
                except Exception:
                    return None
        return None

    try:
        return await asyncio.to_thread(_call)
    except Exception:
        return None


async def llm_answer(
    user_message: str,
    context_blocks: List[str],
    history: Optional[List[Tuple[str, str]]] = None,
) -> str | None:
    # Ưu tiên Gemini nếu có key, sau đó mới tới OpenAI
    if GEMINI_API_KEY:
        return await _gemini_answer(user_message, context_blocks, history)
    if OPENAI_API_KEY:
        return await _openai_answer(user_message, context_blocks, history)
    return None


async def _gemini_answer(
    user_message: str,
    context_blocks: List[str],
    history: Optional[List[Tuple[str, str]]] = None,
) -> str | None:
    ctx = "\n---\n".join(context_blocks)[:14000]
    history = history or []

    # SDK google-genai hiện là sync; chạy trong thread để không block event loop
    def _call() -> str:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        hist = []
        for role, content in history[-10:]:
            who = "Người dùng" if role == "user" else "Trợ lý"
            hist.append(f"{who}: {(content or '')[:1200]}")
        hist_text = "\n".join(hist).strip()

        prompt = (
            f"{SYSTEM_POLICY_VI}\n\n"
            f"{ANSWER_STYLE}\n"
            f"NGỮ CẢNH (từ tài liệu RAG + dữ liệu sản phẩm trong MySQL):\n{ctx}\n\n"
            f"LỊCH SỬ (tóm tắt gần đây):\n{hist_text if hist_text else '(trống)'}\n\n"
            f"CÂU HỎI:\n{user_message}\n\n"
            "Yêu cầu: chỉ dùng thông tin trong NGỮ CẢNH để nêu dữ kiện cụ thể; nếu không đủ dữ liệu thì hỏi lại 1 câu ngắn."
        )

        resp = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.25),
        )
        text = getattr(resp, "text", None) or ""
        return text.strip()

    try:
        out = await asyncio.to_thread(_call)
        return out or None
    except Exception:
        return None


async def _openai_answer(
    user_message: str,
    context_blocks: List[str],
    history: Optional[List[Tuple[str, str]]] = None,
) -> str | None:
    ctx = "\n---\n".join(context_blocks)[:12000]
    history = history or []
    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        messages = [
            {
                "role": "system",
                "content": SYSTEM_POLICY_VI,
            },
        ]
        for role, content in history[-10:]:
            r = "user" if role == "user" else "assistant"
            messages.append({"role": r, "content": (content or "")[:2000]})
        messages.append(
            {
                "role": "user",
                "content": f"Ngữ cảnh tài liệu:\n{ctx}\n\nCâu hỏi khách: {user_message}",
            }
        )
        completion = await client.chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            temperature=0.3,
            messages=messages,
        )
        return (completion.choices[0].message.content or "").strip() or None
    except Exception:
        return None
