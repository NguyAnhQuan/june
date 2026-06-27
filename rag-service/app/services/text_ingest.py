import io
import re
import unicodedata
from typing import List

from docx import Document


def chunk_text(text: str, max_len: int = 1200, overlap: int = 180) -> List[str]:
    cleaned = (
        (text or "")
        .replace("\r\n", "\n")
        .replace("\x00", "")
        .strip()
    )
    if not cleaned:
        return []

    chunks: List[str] = []
    i = 0
    n = len(cleaned)
    while i < n:
        end = min(i + max_len, n)
        if end < n:
            slice_ = cleaned[i:end]
            break_at = max(
                slice_.rfind("\n\n"),
                slice_.rfind("\n"),
                slice_.rfind(". "),
                slice_.rfind("。"),
            )
            if break_at > max_len * 0.35:
                end = i + break_at + 1
        piece = cleaned[i:end].strip()
        if piece:
            chunks.append(piece)
        if end >= n:
            break
        i = max(end - overlap, i + 1)
    return chunks


def normalize_vi(s: str) -> str:
    s = (s or "").lower()
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def tokenize(s: str) -> List[str]:
    n = normalize_vi(s)
    try:
        parts = re.split(r"[^\w]+", n, flags=re.UNICODE)
    except re.error:
        parts = re.split(r"\s+", n)
    return [w for w in parts if len(w) > 1]


def keyword_score(query: str, text: str) -> float:
    q_tokens = set(tokenize(query))
    if not q_tokens:
        return 0.0
    t_norm = normalize_vi(text)
    hit = sum(1 for w in q_tokens if w in t_norm)
    return hit / len(q_tokens)


def bytes_to_plain_text(data: bytes, filename: str, content_type: str | None) -> str:
    name = (filename or "").lower()
    ct = (content_type or "").lower()

    if ct == "text/plain" or name.endswith(".txt"):
        return data.decode("utf-8", errors="replace")

    if "wordprocessingml.document" in ct or name.endswith(".docx"):
        doc = Document(io.BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

    raise ValueError("Chỉ hỗ trợ file .txt hoặc .docx")
