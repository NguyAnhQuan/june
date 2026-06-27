import { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, FileText, AlertCircle, RefreshCw, Bot, Database, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/format';
import Loading from '../../components/common/Loading';

function safeFormatDate(value) {
  if (value == null || value === '') return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : formatDate(d);
}

export default function AdminRagDocs() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  /** 'upload' = gửi file lên Node; 'processing' = chờ Python chunk+embedding; 'done' = hoàn tất trước khi đóng */
  const [uploadPhase, setUploadPhase] = useState('upload');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');

  const fetchList = useCallback(() => {
    setLoadError('');
    setLoading(true);
    api
      .get('/rag/admin/documents')
      .then((res) => {
        const data = res.data;
        setList(Array.isArray(data) ? data : []);
        if (!Array.isArray(data)) {
          setLoadError('Dữ liệu trả về không đúng định dạng.');
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Lỗi mạng';
        setLoadError(msg);
        setList([]);
        toast.error('Không tải được danh sách tài liệu RAG');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const resetUploadUi = () => {
    setUploading(false);
    setUploadPhase('upload');
    setUploadPercent(0);
    setUploadFileName('');
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    if (title.trim()) fd.append('title', title.trim());
    setUploading(true);
    setUploadPhase('upload');
    setUploadPercent(0);
    setUploadFileName(file.name);
    try {
      await api.post('/rag/admin/documents', fd, {
        headers: { 'Content-Type': undefined },
        onUploadProgress: (ev) => {
          const { loaded, total } = ev;
          if (total && total > 0) {
            const pct = Math.round((loaded / total) * 68);
            setUploadPercent(Math.min(68, Math.max(0, pct)));
            if (loaded >= total) {
              setUploadPhase('processing');
              setUploadPercent(68);
            }
          } else {
            setUploadPercent((p) => Math.min(60, p + 15));
          }
        },
      });
      setUploadPercent(100);
      setUploadPhase('done');
      toast.success('Đã xử lý và lưu vector vào MySQL');
      setTitle('');
      fetchList();
      await new Promise((r) => setTimeout(r, 700));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tải lên');
    } finally {
      resetUploadUi();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa tài liệu và toàn bộ vector liên quan?')) return;
    try {
      await api.delete(`/rag/admin/documents/${id}`);
      toast.success('Đã xóa');
      fetchList();
    } catch {
      toast.error('Lỗi xóa');
    }
  };

  if (loading) {
    return <Loading />;
  }

  const totalChunks = list.reduce((s, d) => s + (Number(d.chunk_count) || 0), 0);

  const uploadPhaseLabel =
    uploadPhase === 'upload'
      ? 'Đang gửi file lên máy chủ…'
      : uploadPhase === 'processing'
        ? 'Đang xử lý: chunk & embedding (Python) — có thể mất vài chục giây…'
        : 'Hoàn tất';

  return (
    <div className="space-y-6">
      {uploading && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
            role="dialog"
            aria-labelledby="rag-upload-title"
            aria-busy="true"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <h2 id="rag-upload-title" className="text-lg font-bold text-gray-900">
                  Tải lên tài liệu RAG
                </h2>
                <p className="mt-1 text-xs text-gray-500 truncate" title={uploadFileName}>
                  {uploadFileName}
                </p>
              </div>
              {uploadPhase === 'done' ? (
                <CheckCircle2 className="shrink-0 text-emerald-600" size={22} strokeWidth={2} aria-hidden />
              ) : (
                <Loader2 className="shrink-0 text-indigo-600 animate-spin" size={22} aria-hidden />
              )}
            </div>

            <p className="text-sm text-gray-700 mb-3">{uploadPhaseLabel}</p>

            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
              {uploadPhase === 'processing' ? (
                <div className="absolute left-0 top-0 h-full rounded-full bg-indigo-600 rag-progress-indeterminate" />
              ) : (
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-[width] duration-200 ease-out"
                  style={{ width: `${uploadPercent}%` }}
                />
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>
                {uploadPhase === 'done'
                  ? '100%'
                  : uploadPhase === 'processing'
                    ? 'Chờ phản hồi…'
                    : `${Math.round(uploadPercent)}% · gửi dữ liệu`}
              </span>
              <span className="text-[11px] text-gray-400">Không đóng tab trong lúc xử lý</span>
            </div>
          </div>
        </div>
      )}

      {/* Tiêu đề — cùng nhịp với các trang admin khác */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Bot size={22} strokeWidth={2} />
            <span className="text-xs font-semibold uppercase tracking-wider">Chatbot &amp; RAG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài liệu</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Tải file <strong className="text-gray-700">.txt</strong> hoặc <strong className="text-gray-700">.docx</strong> để hệ thống Python
            (FastAPI) chunk, tạo embedding và lưu vào MySQL. Chatbot trên site sẽ trả lời dựa trên các tài liệu này.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchList()}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300"
        >
          <RefreshCw size={16} />
          Tải lại danh sách
        </button>
      </div>

      {/* Thẻ trạng thái — đồng bộ card trắng + viền nhẹ như Bài viết / Đơn hàng */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Số tài liệu</p>
            <p className="text-2xl font-bold text-gray-900">{list.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Database size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tổng chunk (vector)</p>
            <p className="text-2xl font-bold text-gray-900">{totalChunks}</p>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 shadow-sm">
          <AlertCircle className="shrink-0 mt-0.5 text-amber-600" size={20} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-amber-900">Không kết nối được dịch vụ RAG (Python)</p>
            <p className="text-amber-800/90 mt-1.5 leading-relaxed">{loadError}</p>
            <ul className="mt-3 list-disc list-inside text-xs text-amber-900/80 space-y-1">
              <li>Chạy: <code className="rounded bg-amber-100/80 px-1 py-0.5">python run.py</code> trong thư mục <code className="rounded bg-amber-100/80 px-1">rag-service</code> (mặc định cổng <code className="rounded bg-amber-100/80 px-1">18765</code>)</li>
              <li>Kiểm tra <code className="rounded bg-amber-100/80 px-1">RAG_INTERNAL_SECRET</code> trùng trong <code className="rounded bg-amber-100/80 px-1">server/.env</code></li>
            </ul>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload size={16} className="text-indigo-600" />
          Thêm tài liệu mới
        </h2>
        <div className="max-w-xl space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tiêu đề hiển thị (tùy chọn)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Để trống = dùng tên file"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
            />
          </div>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-colors">
            <Upload size={16} />
            {uploading ? 'Đang xử lý trên Python…' : 'Chọn file .txt hoặc .docx'}
            <input
              type="file"
              accept=".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
          <h2 className="text-sm font-semibold text-gray-800">Danh sách đã lưu</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tiêu đề</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">File gốc</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600 w-24">Chunk</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600 w-36">Ngày tạo</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600 w-20">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 px-4 text-center text-gray-500">
                    <FileText className="mx-auto mb-3 text-gray-300" size={40} strokeWidth={1.25} />
                    <p className="text-sm font-medium text-gray-600">Chưa có tài liệu</p>
                    <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                      Upload file phía trên hoặc chạy <code className="text-gray-600 bg-gray-100 px-1 rounded">python seed_samples.py</code> trong{' '}
                      <code className="text-gray-600 bg-gray-100 px-1 rounded">rag-service</code>.
                    </p>
                  </td>
                </tr>
              ) : (
                list.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-indigo-50/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{d.title}</td>
                    <td className="py-3 px-4 text-gray-600">{d.original_filename}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold py-0.5 px-2">
                        {d.chunk_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500">{safeFormatDate(d.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id)}
                        className="inline-flex p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa tài liệu"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
