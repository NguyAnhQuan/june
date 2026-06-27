from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from app.services.text_ingest import tokenize


@dataclass
class KeywordPlan:
    # loại sản phẩm (dùng để lọc category)
    product_type: Optional[str]
    # keyword bắt buộc (strict) – dùng để LIKE vào name/slug
    must_terms: List[str]
    # keyword mềm (soft) – dùng để tăng điểm
    soft_terms: List[str]
    # thuộc tính
    colors: List[str]
    sizes: List[str]


STOP = {
    "ve",
    "về",
    "cho",
    "minh",
    "mình",
    "toi",
    "tôi",
    "hoi",
    "hỏi",
    "muon",
    "muốn",
    "can",
    "cần",
    "co",
    "có",
    "la",
    "là",
    "khong",
    "không",
    "bao",
    "nhiêu",
    "nhieu",
    "gia",
    "giá",
    "ship",
    "phi",
    "phí",
    "giao",
    "hang",
    "hàng",
}


def _product_type(tokens: List[str]) -> Optional[str]:
    s = " ".join(tokens)
    if "vay" in tokens or "váy" in tokens:
        return "váy"
    if "quan" in tokens or "quần" in tokens:
        return "quần"
    if "ao" in tokens or "áo" in tokens:
        return "áo"
    if "polo" in tokens:
        return "áo"
    return None


def extractKeywords(message: str) -> KeywordPlan:
    toks = tokenize(message or "")
    toks2 = [t for t in toks if t and t not in STOP]

    ptype = _product_type(toks)

    # heuristics:
    # - nếu có product_type (váy/quần/áo), coi đó là must
    # - còn lại chọn 1-2 token dài làm must, phần còn lại soft
    long_tokens = [t for t in toks2 if len(t) >= 3]
    must = []
    soft = []
    if ptype:
        must.append(ptype)
    for t in long_tokens:
        if t in must:
            continue
        if len(must) < 2:
            must.append(t)
        else:
            soft.append(t)

    # colors/sizes (đơn giản)
    colors = [t for t in toks if t in {"den", "trang", "xam", "navy", "do", "be", "xanh", "xanhreu"}]
    sizes = [t.upper() for t in toks if t.lower() in {"s", "m", "l", "xl", "xxl"}]

    # soft cũng chứa phần còn lại (tối đa)
    for t in toks2:
        if t not in must and t not in soft:
            soft.append(t)
    soft = soft[:8]

    return KeywordPlan(
        product_type=ptype,
        must_terms=must[:3],
        soft_terms=soft,
        colors=colors[:4],
        sizes=sizes[:4],
    )

