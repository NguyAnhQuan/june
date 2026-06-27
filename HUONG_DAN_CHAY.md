# Hướng dẫn chạy dự án June

Dự án gồm **backend Node.js (Express + Sequelize + MySQL)**, **dịch vụ chatbot RAG bằng Python (FastAPI)** và **frontend React (Create React App + Tailwind)**.

## Yêu cầu môi trường

- [Node.js](https://nodejs.org/) (khuyến nghị LTS, tương thích `react-scripts` 5)
- [Python](https://www.python.org/) 3.10+ (cho `rag-service`: FastAPI, sentence-transformers)
- [MySQL](https://dev.mysql.com/downloads/) đã cài và chạy dịch vụ
- Ba terminal (hoặc tab): Python RAG, Node API, React client

## Cấu trúc thư mục

| Thư mục | Vai trò |
|---------|---------|
| `server/` | API REST, xác thực JWT, đồng bộ model Sequelize với MySQL; **proxy** `/api/rag/*` sang Python |
| `rag-service/` | **Python**: chunk văn bản, embedding (sentence-transformers), lưu vector JSON trong MySQL, trả lời RAG |
| `rag-samples/` | File `.txt` mẫu để upload thử hoặc nạp bằng script |
| `client/` | Giao diện React, widget chat góc màn hình, trang admin **Chatbot / RAG** |

## 1. Chuẩn bị database MySQL

1. Tạo database (ví dụ tên `june_shop`).
2. Ghi nhớ: tên database, user, mật khẩu, host (thường `localhost`).

Server dùng biến môi trường trong `server/config/database.js`: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`.

## 2. Cấu hình biến môi trường server

Trong thư mục `server/`, tạo file **`.env`** (không commit file này nếu có chứa bí mật). Tối thiểu để chạy cục bộ:

```env
# Bắt buộc cho kết nối DB và đăng nhập
DB_HOST=localhost
DB_NAME=june_shop
DB_USER=root
DB_PASSWORD=mật_khẩu_mysql

JWT_SECRET=một_chuỗi_bí_mật_dài_ngẫu_nhiên
JWT_EXPIRES_IN=7d

# Cổng API — phải khớp với baseURL trong client (xem mục 5)
PORT=5002
```

**Ghi chú cổng:** Trong `client/src/services/api.js`, `baseURL` đang trỏ tới `http://localhost:5002/api`. Server mặc định trong `server.js` là cổng **5000** nếu không set `PORT`. Bạn nên đặt `PORT=5002` trong `.env` **hoặc** sửa `baseURL` trong `api.js` cho trùng với cổng server thực tế.

### Biến tùy chọn / tính năng mở rộng

| Biến | Dùng cho |
|------|----------|
| `CLIENT_URL` | Link trong email đặt lại mật khẩu (mặc định `http://localhost:3000`) |
| `CLOUDINARY_*` | Upload ảnh qua Cloudinary (`server/config/cloudinary.js`) |
| `RESEND_API_KEY`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | Gửi email qua Resend |
| `VNPAY_*` | Thanh toán VNPay (`server/utils/vnpay.js`) |
| `RAG_SERVICE_URL` | URL dịch vụ Python (mặc định `http://127.0.0.1:18765`) |
| `RAG_PORT` | Cổng uvicorn RAG (mặc định `18765`, đặt trong `server/.env`) |
| `RAG_INTERNAL_SECRET` | Chuỗi bí mật chung giữa Node và Python (bắt buộc khớp nhau) |

Nếu thiếu các biến tùy chọn, một số chức năng (upload cloud, email, VNPay) có thể lỗi khi gọi — phần cốt lõi shop vẫn cần DB + JWT.

### Chatbot RAG (Python)

Thêm vào `server/.env` (cùng giá trị `RAG_INTERNAL_SECRET` với Python):

```env
RAG_SERVICE_URL=http://127.0.0.1:18765
RAG_PORT=18765
RAG_INTERNAL_SECRET=doi-mot-chuoi-bi-mat-dai
```

Tạo venv và chạy FastAPI (lần đầu sẽ tải model embedding, có thể vài phút):

```powershell
cd rag-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Python đọc `DB_*` từ `server/.env` (hoặc `rag-service/.env`). Tùy chọn trong `rag-service`: `OPENAI_API_KEY` để sinh câu trả lời tự nhiên hơn; không có thì bot vẫn trả lời bằng trích đoạn tài liệu.
Ngoài ra có thể dùng **Gemini** để trả lời mượt hơn bằng cách cấu hình `GEMINI_API_KEY` (khuyến nghị) và `GEMINI_MODEL` trong `server/.env` (rag-service sẽ tự đọc).

Ví dụ:

```env
GEMINI_API_KEY=YOUR_KEY_HERE
GEMINI_MODEL=gemini-2.5-flash
```

**Nạp dữ liệu mẫu vào vector DB (MySQL):** sau khi Node đã chạy ít nhất một lần (để tạo bảng `rag_*`):

```powershell
cd rag-service
.\venv\Scripts\activate
python seed_samples.py
```

Hoặc vào **Admin → Chatbot / RAG** upload các file trong `rag-samples/`.

**Luồng:** người dùng hỏi qua widget → Node gọi Python → Python truy vấn `rag_chunks` + `rag_session_chunks` (file user đính kèm trong phiên), tính độ tương đồng vector/từ khóa, ghép ngữ cảnh và trả lời. Mỗi tin nhắn được lưu vào MySQL (`rag_chat_sessions`, `rag_chat_messages`); mở lại widget sẽ tải lịch sử.

**Tạo bảng trên MySQL:** chạy file `database_rag_chatbot.sql` (đã gộp phần cuối vào `database.sql`). Ví dụ:

`mysql -u root -p june_db < database_rag_chatbot.sql`

Hoặc chạy `npm run dev` (Sequelize `sync`) sau khi đã có model — vẫn nên chạy SQL nếu cần FK đúng như file patch.

## 3. Cài đặt và chạy backend

```bash
cd server
npm install
```

Chạy production (một process):

```bash
npm start
```

Chạy development (tự restart khi sửa file, cần `nodemon`):

```bash
npm run dev
```

Khi thành công, console hiển thị dạng: `Server đang chạy tại port <PORT>`. Sequelize gọi `sync({ alter: true })` khi khởi động — bảng sẽ được tạo/cập nhật theo model.

### Dữ liệu mẫu (tùy chọn)

```bash
npm run seed
```

**Cảnh báo:** `seed.js` dùng `sequelize.sync({ force: true })` — **xóa toàn bộ dữ liệu** trong database rồi tạo lại và nạp mẫu. Chỉ chạy khi bạn chấp nhận reset DB.

Trong seed có tài khoản thử (ví dụ admin `admin@june.vn` / `admin123` — xem chi tiết trong `server/seeders/seed.js`).

## 4. Cài đặt và chạy frontend

Mở terminal mới:

```bash
cd client
npm install
npm start
```

Ứng dụng React thường mở tại **http://localhost:3000**. CORS trên server chỉ cho phép origin `http://localhost:3000` (`server/server.js`).

## 5. Kiểm tra trước khi dùng

1. MySQL đang chạy và `.env` đúng thông tin.
2. Backend đã listen đúng cổng khớp `api.js` (mặc định code client: **5002**).
3. Frontend chạy trên **3000** (đúng với cấu hình CORS).

## 6. Build frontend cho production

```bash
cd client
npm run build
```

Thư mục `client/build/` chứa static files; cần web server (nginx, IIS, v.v.) hoặc tích hợp serve static từ Express nếu triển khai một máy.

## Tóm tắt lệnh nhanh

```bash
# Terminal 1 — RAG Python
cd rag-service && python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt && python run.py

# Terminal 2 — backend Node
cd server && npm install && npm run dev

# Terminal 3 — frontend
cd client && npm install && npm start
```

Đảm bảo file `server/.env` đã cấu hình (gồm `RAG_*` nếu dùng chatbot) và (nếu cần) đã chạy `npm run seed` một lần trên database trống hoặc sau khi chấp nhận xóa dữ liệu. Chạy `python seed_samples.py` trong `rag-service` để có tài liệu cho chatbot thử ngay.
