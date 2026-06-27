"""
Nạp các file .txt trong thư mục rag-samples (gốc dự án) vào MySQL qua pipeline RAG.
Chạy sau khi đã tạo bảng (khởi động Node một lần để sequelize sync).

  cd rag-service
  python -m venv venv
  venv\\Scripts\\activate
  pip install -r requirements.txt
  python seed_samples.py
"""
from pathlib import Path

from sqlalchemy import text

from app.database import get_engine
from app.services.rag_pipeline import ingest_plain_text


def main():
    project_root = Path(__file__).resolve().parent.parent
    samples_dir = project_root / "rag-samples"
    if not samples_dir.is_dir():
        print("Không thấy thư mục rag-samples:", samples_dir)
        return

    engine = get_engine()
    for path in sorted(samples_dir.glob("*.txt")):
        title = path.stem
        with engine.connect() as conn:
            exists = conn.execute(
                text("SELECT id FROM rag_documents WHERE title = :t LIMIT 1"),
                {"t": title},
            ).first()
        if exists:
            print("Bỏ qua (đã có):", path.name)
            continue
        text_body = path.read_text(encoding="utf-8")
        with engine.begin() as conn:
            ingest_plain_text(
                conn,
                title=title,
                original_filename=path.name,
                mime_type="text/plain",
                text_body=text_body,
                uploaded_by=None,
                session_id=None,
            )
        print("Đã nạp:", path.name)

    print("Xong.")


if __name__ == "__main__":
    main()
