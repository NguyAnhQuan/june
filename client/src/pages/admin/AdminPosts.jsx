import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/format';
import Loading from '../../components/common/Loading';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', thumbnail: '', is_published: false });

  const fetch = () => { api.get('/admin/posts').then(res => setPosts(res.data)).catch(() => { }).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('image', file);
    try { const res = await api.post('/upload', fd, { headers: { 'Content-Type': undefined } }); setForm({ ...form, thumbnail: res.data.url }); toast.success('Tải ảnh thành công'); } catch { toast.error('Lỗi tải ảnh'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/admin/posts/${editing.id}`, form); toast.success('Cập nhật thành công'); }
      else { await api.post('/admin/posts', form); toast.success('Thêm thành công'); }
      setShowModal(false); fetch();
    } catch { toast.error('Lỗi'); }
  };

  const handleDelete = async (id) => { if (!window.confirm('Xóa bài viết?')) return; try { await api.delete(`/admin/posts/${id}`); toast.success('Đã xóa'); fetch(); } catch { toast.error('Lỗi'); } };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bài viết</h1>
        <button onClick={() => { setEditing(null); setForm({ title: '', content: '', thumbnail: '', is_published: false }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus size={16} /> Thêm</button>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-medium text-gray-600">Tiêu đề</th><th className="text-center p-3 font-medium text-gray-600">Trạng thái</th><th className="text-center p-3 font-medium text-gray-600">Ngày tạo</th><th className="text-center p-3 font-medium text-gray-600">Thao tác</th></tr></thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{p.title}</td>
                <td className="p-3 text-center"><span className={`text-xs px-2 py-1 rounded-full ${p.is_published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{p.is_published ? 'Đã xuất bản' : 'Nháp'}</span></td>
                <td className="p-3 text-center text-gray-500">{formatDate(p.createdAt)}</td>
                <td className="p-3"><div className="flex justify-center gap-1"><button onClick={() => { setEditing(p); setForm({ title: p.title, content: p.content, thumbnail: p.thumbnail, is_published: p.is_published }); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button><button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 my-8 p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Sửa bài viết' : 'Thêm bài viết'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa</label>{form.thumbnail && <img src={form.thumbnail} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />}<input type="file" accept="image/*" onChange={handleUpload} className="text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none" /></div>
              <div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded border-gray-300" /> Xuất bản ngay</label></div>
              <div className="flex gap-2 pt-2"><button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">{editing ? 'Cập nhật' : 'Thêm'}</button><button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Hủy</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
