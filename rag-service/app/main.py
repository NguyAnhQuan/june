from typing import Optional

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from app.config import RAG_INTERNAL_SECRET, MAX_FILE_BYTES
from app.database import get_engine
from app.services.answer import llm_answer
from app.services import chat_storage
from app.services.answer import is_smalltalk, smalltalk_reply
from app.services.intent_classifier import intent_classifier
from app.services.vector_search import vectorSearch
from app.services.keyword_extractor import extractKeywords
from app.services.product_search import searchProducts, rankProducts
from app.services.response_formatter import formatResponse_products_ranked
from app.services.conversation_context import (
    load_ctx,
    dump_ctx,
    detectFollowUp,
    mergeContext,
    updateContext,
)
from app.services.faq_handlers import handleShipping, handlePromotion
from sqlalchemy import text


def verify_secret(x_rag_secret: Optional[str] = Header(None, alias="X-RAG-SECRET")):
    if not x_rag_secret or x_rag_secret != RAG_INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Không hợp lệ")
    return True


app = FastAPI(title="June RAG Chatbot", version="1.0.0")


class ChatBody(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: str = Field(default="anon", min_length=1, max_length=128)
    user_id: Optional[int] = None


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/v1/chat/history", dependencies=[Depends(verify_secret)])
def chat_history(session_key: str = Query(..., min_length=8, max_length=128)):
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT id FROM rag_chat_sessions WHERE public_session_key = :k LIMIT 1"),
            {"k": session_key.strip()},
        ).first()
        if not row:
            return {"messages": []}
        sid = int(row[0])
        rows = conn.execute(
            text(
                """
                SELECT role, content, created_at FROM rag_chat_messages
                WHERE chat_session_id = :sid
                ORDER BY created_at ASC
                LIMIT 300
                """
            ),
            {"sid": sid},
        ).mappings().all()
    return {
        "messages": [
            {
                "role": r["role"],
                "content": r["content"],
                "at": r["created_at"].isoformat() if r["created_at"] else None,
            }
            for r in rows
        ]
    }


@app.delete("/v1/chat/history", dependencies=[Depends(verify_secret)])
def clear_history(session_key: str = Query(..., min_length=8, max_length=128)):
    """
    Xóa lịch sử hội thoại (rag_chat_sessions + rag_chat_messages) và file tạm của phiên (rag_session_chunks).
    Không đụng tới tài liệu admin.
    """
    engine = get_engine()
    with engine.begin() as conn:
        row = conn.execute(
            text("SELECT id FROM rag_chat_sessions WHERE public_session_key = :k LIMIT 1"),
            {"k": session_key.strip()},
        ).first()
        if not row:
            return {"deleted": False}
        sid = int(row[0])
        conn.execute(text("DELETE FROM rag_chat_messages WHERE chat_session_id = :sid"), {"sid": sid})
        conn.execute(text("DELETE FROM rag_chat_sessions WHERE id = :sid"), {"sid": sid})
        conn.execute(text("DELETE FROM rag_session_chunks WHERE session_id = :sk"), {"sk": session_key.strip()})
    return {"deleted": True}


@app.post("/v1/chat")
async def chat(body: ChatBody, _: bool = Depends(verify_secret)):
    engine = get_engine()
    sid = (body.session_id or "anon").strip() or "anon"
    msg = body.message.strip()

    with engine.begin() as conn:
        internal = chat_storage.get_or_create_session(conn, sid, body.user_id)
        history = chat_storage.load_history_tail(conn, internal, 12)
        chat_storage.insert_message(conn, internal, "user", msg)
        raw_ctx = chat_storage.get_context(conn, internal)
        ctx = load_ctx(raw_ctx)

    # Smalltalk: trả lời nhanh, không truy vấn RAG/DB nặng
    if is_smalltalk(msg):
        reply = smalltalk_reply()
        sources: list = []
        with engine.begin() as conn:
            chat_storage.insert_message(conn, internal, "assistant", reply, None)
        return {"reply": reply, "sources": sources}

    intent = await intent_classifier(msg)
    if detectFollowUp(msg, ctx, intent.intent):
        # follow-up: dùng lại intent/topic trước đó
        intent.intent = (ctx.last_intent or intent.intent)  # type: ignore[attr-defined]
    ctx = mergeContext(msg, ctx)

    # ROUTING
    if intent.intent == "PRODUCT_QUERY":
        ctx = updateContext(ctx, "PRODUCT_QUERY", "product")
        # Step 1: extract main keywords/entities
        plan = extractKeywords(msg)
        with engine.connect() as conn:
            # Step 2: SQL filter (strict)
            candidates = searchProducts(conn, plan, limit=80)
            # Step 3: embedding ranking over filtered results
            ranked = rankProducts(msg, candidates, plan, top_k=5)

        if ranked:
            # Step 4: return only relevant products
            reply = formatResponse_products_ranked(ranked)
            sources = [{"title": "SQL: products", "preview": ranked[0].row.get("name", "")}]
        else:
            # 2) fallback to RAG (thresholded)
            with engine.connect() as conn:
                vs = vectorSearch(conn, sid, msg, top_k=6, similarity_threshold=0.7)
            if vs.hits:
                ctx = [
                    f"[{i+1}] ({r['source_label']}, score {float(r['score']):.3f})\n{r['content']}"
                    for i, r in enumerate(vs.hits)
                ]
                reply = await llm_answer(msg, ctx, history) or (
                    "Mình chưa tìm thấy sản phẩm phù hợp trong DB và cũng không có FAQ liên quan đủ mạnh. "
                    "Bạn cho mình tên/slug sản phẩm cụ thể hơn nhé."
                )
                sources = [{"title": r["source_label"], "preview": r["content"][:160]} for r in vs.hits]
            else:
                reply = await llm_answer(
                    msg,
                    [
                        "[1] Hướng dẫn: Không có sản phẩm phù hợp trong DB và RAG không đủ tự tin.\n"
                        "Hãy trả lời đúng ý người dùng về sản phẩm theo cách hữu ích: hỏi lại 1 câu ngắn để làm rõ "
                        "(tên/kiểu/danh mục/giá/size/màu). Không bịa thông tin sản phẩm cụ thể."
                    ],
                    history,
                ) or "Bạn cho mình tên sản phẩm/danh mục/giá mong muốn để mình tìm đúng sản phẩm nhé."
                sources = []

    elif intent.intent == "FAQ_QUERY":
        ctx = updateContext(ctx, "FAQ_QUERY", "shipping" if "ship" in msg.lower() or "giao" in msg.lower() else "other")
        with engine.connect() as conn:
            # FAQ thường có cosine thấp hơn (ngắn), nên threshold 0.45 để không bỏ lỡ policy
            vs = vectorSearch(conn, sid, msg, top_k=6, similarity_threshold=0.45)
        if vs.hits:
            ctx = [
                f"[{i+1}] ({r['source_label']}, score {float(r['score']):.3f})\n{r['content']}"
                for i, r in enumerate(vs.hits)
            ]
            reply = await llm_answer(msg, ctx, history) or "Mình chưa đủ dữ liệu để trả lời chính xác."
            sources = [{"title": r["source_label"], "preview": r["content"][:160]} for r in vs.hits]
        else:
            # fallback shipping logic nếu có đủ entity
            if "ship" in msg.lower() or "giao" in msg.lower() or ctx.last_topic == "shipping":
                reply = handleShipping(ctx_location=ctx.location, ctx_order_value=ctx.order_value)
            else:
                reply = await llm_answer(
                    msg,
                    [
                        "[1] Hướng dẫn: Không có kết quả RAG đủ tự tin.\n"
                        "Hãy trả lời theo nghiệp vụ website June một cách cụ thể, ngắn gọn, đúng câu hỏi. "
                        "Nếu thiếu thông tin số liệu, nói rõ 'mình chưa có số liệu trong dữ liệu hiện có'."
                    ],
                    history,
                ) or "Bạn hỏi rõ hơn để mình trả lời chính xác nhé."
            sources = []

    elif intent.intent == "PROMOTION_QUERY":
        ctx = updateContext(ctx, "PROMOTION_QUERY", "promotion")
        with engine.connect() as conn:
            reply, sources = handlePromotion(conn, msg)

    else:
        ctx = updateContext(ctx, "OTHER", "other")
        reply = await llm_answer(
            msg,
            [
                "[1] Hướng dẫn: Trả lời ngắn gọn, đúng câu hỏi. "
                "Nếu người dùng hỏi về ship/khuyến mãi/sản phẩm thì yêu cầu họ cung cấp thêm 1 thông tin cần thiết."
            ],
            history,
        ) or "Bạn cho mình biết bạn muốn hỏi về sản phẩm, phí ship, hay khuyến mãi nhé."
        sources = []

    with engine.begin() as conn:
        chat_storage.insert_message(conn, internal, "assistant", reply, sources if sources else None)
        chat_storage.set_context(conn, internal, dump_ctx(ctx))

    return {"reply": reply, "sources": sources}


@app.get("/v1/admin/documents", dependencies=[Depends(verify_secret)])
def list_documents():
    engine = get_engine()
    with engine.connect() as conn:
        r = conn.execute(
            text(
                """
                SELECT id, title, original_filename, mime_type, chunk_count, created_at
                FROM rag_documents
                ORDER BY created_at DESC
                """
            )
        ).mappings().all()
    return [
        {
            "id": row["id"],
            "title": row["title"],
            "original_filename": row["original_filename"],
            "mime_type": row["mime_type"],
            "chunk_count": row["chunk_count"],
            "createdAt": row["created_at"].isoformat() if row["created_at"] else None,
        }
        for row in r
    ]


@app.post("/v1/admin/documents", dependencies=[Depends(verify_secret)])
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(""),
    uploaded_by: str = Form("0"),
):
    data = await file.read()
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(400, "File tối đa 8MB")
    uid = int(uploaded_by or 0) or None
    engine = get_engine()
    try:
        with engine.begin() as conn:
            result = rag_pipeline.extract_and_ingest_file(
                conn,
                data,
                file.filename or "upload.txt",
                file.content_type,
                title=title or None,
                uploaded_by=uid,
                session_id=None,
            )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    return {
        "message": "Đã lưu tài liệu và vector",
        "document": result.get("document"),
        "chunkCount": result.get("chunk_count"),
        "usedEmbedding": True,
    }


@app.delete("/v1/admin/documents/{doc_id}", dependencies=[Depends(verify_secret)])
def delete_document(doc_id: int):
    engine = get_engine()
    with engine.begin() as conn:
        r = conn.execute(text("SELECT id FROM rag_documents WHERE id = :id"), {"id": doc_id}).first()
        if not r:
            raise HTTPException(404, "Không tìm thấy")
        conn.execute(text("DELETE FROM rag_chunks WHERE document_id = :id"), {"id": doc_id})
        conn.execute(text("DELETE FROM rag_documents WHERE id = :id"), {"id": doc_id})
    return {"message": "Đã xóa"}


@app.post("/v1/session/upload", dependencies=[Depends(verify_secret)])
async def session_upload(
    file: UploadFile = File(...),
    session_id: str = Form(...),
):
    sid = (session_id or "").strip()
    if len(sid) < 8:
        raise HTTPException(400, "session_id không hợp lệ")
    data = await file.read()
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(400, "File tối đa 8MB")
    engine = get_engine()
    try:
        with engine.begin() as conn:
            result = rag_pipeline.extract_and_ingest_file(
                conn,
                data,
                file.filename or "upload.txt",
                file.content_type,
                session_id=sid,
            )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    return {"message": "Đã thêm file vào phiên chat", "chunkCount": result["chunk_count"], "usedEmbedding": True}
