import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Paperclip, Loader2, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const WELCOME =
  'Xin chào! Mình là trợ lý June — tư vấn theo tài liệu cửa hàng hoặc file bạn đính kèm (.txt / .docx). Hội thoại được lưu để bạn tiếp tục sau.';

function getSessionId() {
  try {
    let s = localStorage.getItem('june_rag_session');
    if (!s) {
      s = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`;
      localStorage.setItem('june_rag_session', s);
    }
    return s;
  } catch {
    return `s-${Date.now()}`;
  }
}

function renderRichText(text) {
  const s = String(text || '');
  const lines = s.split('\n');

  const renderInline = (line, keyPrefix) => {
    const parts = [];
    let i = 0;
    let k = 0;
    while (i < line.length) {
      const boldStart = line.indexOf('**', i);
      const linkMatch = line.slice(i).match(/\/product\/[a-z0-9-]+/i);
      const linkStart = linkMatch ? i + linkMatch.index : -1;

      const next = [boldStart, linkStart].filter((x) => x >= 0).sort((a, b) => a - b)[0];
      if (next == null) {
        parts.push(<span key={`${keyPrefix}-t-${k++}`}>{line.slice(i)}</span>);
        break;
      }

      if (next > i) {
        parts.push(<span key={`${keyPrefix}-t-${k++}`}>{line.slice(i, next)}</span>);
        i = next;
      }

      if (i === boldStart) {
        const end = line.indexOf('**', boldStart + 2);
        if (end > boldStart) {
          const inner = line.slice(boldStart + 2, end);
          parts.push(<strong key={`${keyPrefix}-b-${k++}`}>{inner}</strong>);
          i = end + 2;
          continue;
        }
      }

      if (i === linkStart) {
        const url = linkMatch[0];
        parts.push(
          <a
            key={`${keyPrefix}-a-${k++}`}
            href={url}
            className="underline underline-offset-2 text-brand-700 hover:text-brand-800"
            target="_self"
            rel="noreferrer"
          >
            {url}
          </a>
        );
        i = linkStart + url.length;
        continue;
      }

      // fallback: tránh loop vô hạn
      parts.push(<span key={`${keyPrefix}-t-${k++}`}>{line.slice(i, i + 1)}</span>);
      i += 1;
    }
    return parts;
  };

  return (
    <span>
      {lines.map((line, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`l-${idx}`}>
          {renderInline(line, `l-${idx}`)}
          {idx < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const sessionRef = useRef(getSessionId());
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/rag/chat/history', { params: { sessionId: sessionRef.current } });
        if (cancelled) return;
        const raw = res.data?.messages;
        if (Array.isArray(raw) && raw.length > 0) {
          setMessages(
            raw.map((m) => ({
              role: m.role === 'user' ? 'user' : 'bot',
              text: m.content || '',
            }))
          );
        } else {
          setMessages([{ role: 'bot', text: WELCOME }]);
        }
      } catch {
        if (!cancelled) setMessages([{ role: 'bot', text: WELCOME }]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await api.post('/rag/chat', {
        message: text,
        sessionId: sessionRef.current,
      });
      setMessages((m) => [...m, { role: 'bot', text: res.data.reply || 'Không có phản hồi.' }]);
    } catch (e) {
      const msg = e.response?.data?.message || 'Lỗi kết nối chatbot.';
      toast.error(msg);
      setMessages((m) => [...m, { role: 'bot', text: msg }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('sessionId', sessionRef.current);
    setUploading(true);
    try {
      await api.post('/rag/session/upload', fd, { headers: { 'Content-Type': undefined } });
      toast.success(`Đã thêm «${file.name}» vào phiên chat`);
      setMessages((m) => [...m, { role: 'bot', text: `Đã nạp file «${file.name}». Bạn hỏi nội dung trong file nhé.` }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tải file');
    } finally {
      setUploading(false);
    }
  };

  const clearHistory = async () => {
    const current = sessionRef.current;
    if (!current || current.length < 8) {
      setMessages([{ role: 'bot', text: WELCOME }]);
      return;
    }
    try {
      await api.delete('/rag/chat/history', { params: { sessionId: current } });
    } catch {
      // ignore network errors — vẫn xóa phía client
    }
    try {
      localStorage.removeItem('june_rag_session');
    } catch {
      // ignore
    }
    sessionRef.current =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`;
    setMessages([{ role: 'bot', text: WELCOME }]);
    toast.success('Đã xóa lịch sử chat cho phiên hiện tại');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 ring-2 ring-white transition hover:from-brand-600 hover:to-brand-800 hover:scale-105 active:scale-95"
        aria-label={open ? 'Đóng chat' : 'Mở chat tư vấn'}
      >
        {open ? <X size={24} strokeWidth={2.25} /> : <MessageCircle size={26} strokeWidth={2.25} />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-5 z-[60] flex h-[min(72vh,520px)] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-400/25"
          style={{ fontFamily: 'inherit' }}
        >
          <div className="relative flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold tracking-wide">June · Tư vấn</p>
              <p className="text-[11px] text-white/85 truncate">Theo tài liệu shop · Lưu hội thoại</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-br from-brand-600 to-brand-700 text-white'
                      : 'rounded-bl-md border border-gray-100 bg-white text-gray-800'
                  }`}
                >
                  {renderRichText(msg.text)}
                </div>
              </div>
            ))}
            {(loading || uploading) && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-3.5 py-2.5 text-xs text-gray-500 shadow-sm">
                  <Loader2 size={14} className="animate-spin text-brand-500" />
                  Đang xử lý…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <label
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
                title="Đính kèm .txt / .docx"
              >
                <Paperclip size={18} />
                <input type="file" accept=".txt,.docx" className="hidden" disabled={uploading || loading} onChange={onFile} />
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Nhập câu hỏi…"
                rows={2}
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                disabled={loading}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Gửi"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-gray-400">Phản hồi dựa trên tài liệu đã nạp · June Shop</p>
              <button
                type="button"
                onClick={clearHistory}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={10} />
                Xóa lịch sử
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
