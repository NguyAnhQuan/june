const axios = require('axios');
const FormData = require('form-data');

const RAG_BASE = (process.env.RAG_SERVICE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const RAG_SECRET = process.env.RAG_INTERNAL_SECRET || 'dev-rag-secret-doi-trong-production';

function ragHeaders(extra = {}) {
  return { 'X-RAG-SECRET': RAG_SECRET, ...extra };
}

function formatAxiosError(e) {
  const d = e.response?.data?.detail;
  if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join(', ');
  if (typeof d === 'string') return d;
  if (d && typeof d === 'object') return d.message || JSON.stringify(d);
  return e.message || 'Lỗi kết nối';
}

/** Python trả 401 khi sai X-RAG-SECRET — map sang 502 để axios client không xóa JWT admin. */
function mapProxyStatus(status) {
  if (status === 401) return 502;
  return status || 503;
}

function proxyFail(res, e, prefix) {
  const code = mapProxyStatus(e.response?.status);
  const hint = code === 502 ? ' Kiểm tra RAG_INTERNAL_SECRET trùng giữa server/.env và rag-service.' : '';
  res.status(code).json({
    message: `${prefix}: ${formatAxiosError(e)}.${hint} Hãy chạy uvicorn rag-service.`,
  });
}

exports.proxyChat = async (req, res) => {
  try {
    const r = await axios.post(
      `${RAG_BASE}/v1/chat`,
      {
        message: req.body.message,
        session_id: req.body.sessionId || 'anon',
        user_id: req.user?.id ?? null,
      },
      { headers: ragHeaders({ 'Content-Type': 'application/json' }), timeout: 120000 }
    );
    res.json(r.data);
  } catch (e) {
    proxyFail(res, e, 'Chatbot Python');
  }
};

exports.proxyChatHistory = async (req, res) => {
  try {
    const sessionKey = (req.query.sessionId || '').trim();
    if (sessionKey.length < 8) {
      return res.status(400).json({ message: 'Thiếu sessionId' });
    }
    const r = await axios.get(`${RAG_BASE}/v1/chat/history`, {
      params: { session_key: sessionKey },
      headers: ragHeaders(),
      timeout: 60000,
    });
    res.json(r.data);
  } catch (e) {
    proxyFail(res, e, 'Lịch sử chat');
  }
};

exports.proxyClearHistory = async (req, res) => {
  try {
    const sessionKey = (req.query.sessionId || '').trim();
    if (sessionKey.length < 8) {
      return res.status(400).json({ message: 'Thiếu sessionId' });
    }
    const r = await axios.delete(`${RAG_BASE}/v1/chat/history`, {
      params: { session_key: sessionKey },
      headers: ragHeaders(),
      timeout: 60000,
    });
    res.json(r.data);
  } catch (e) {
    proxyFail(res, e, 'Xóa lịch sử chat');
  }
};

exports.proxySessionUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Chọn file .txt hoặc .docx' });
    const sessionId = (req.body.sessionId || '').trim();
    if (sessionId.length < 8) return res.status(400).json({ message: 'Thiếu sessionId' });

    const form = new FormData();
    form.append('session_id', sessionId);
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const r = await axios.post(`${RAG_BASE}/v1/session/upload`, form, {
      headers: { ...form.getHeaders(), ...ragHeaders() },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 300000,
    });
    res.status(r.status).json(r.data);
  } catch (e) {
    proxyFail(res, e, 'Tải file phiên chat');
  }
};

exports.proxyListDocuments = async (req, res) => {
  try {
    const r = await axios.get(`${RAG_BASE}/v1/admin/documents`, {
      headers: ragHeaders(),
      timeout: 60000,
    });
    res.json(r.data);
  } catch (e) {
    proxyFail(res, e, 'Danh sách tài liệu RAG');
  }
};

exports.proxyUploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Chọn file .txt hoặc .docx' });

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append('title', req.body.title || '');
    form.append('uploaded_by', String(req.user.id));

    const r = await axios.post(`${RAG_BASE}/v1/admin/documents`, form, {
      headers: { ...form.getHeaders(), ...ragHeaders() },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 300000,
    });
    res.status(r.status).json(r.data);
  } catch (e) {
    proxyFail(res, e, 'Upload tài liệu RAG');
  }
};

exports.proxyDeleteDocument = async (req, res) => {
  try {
    const r = await axios.delete(`${RAG_BASE}/v1/admin/documents/${req.params.id}`, {
      headers: ragHeaders(),
      timeout: 60000,
    });
    res.json(r.data);
  } catch (e) {
    proxyFail(res, e, 'Xóa tài liệu RAG');
  }
};
