import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', image_url: '', link: '', position: 0 });

  const fetch = () => { api.get('/admin/banners').then(res => setBanners(res.data)).catch(() => { }).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('image', file);
    try { const res = await api.post('/upload', fd, { headers: { 'Content-Type': undefined } }); setForm({ ...form, image_url: res.data.url }); toast.success('Tải ảnh thành công'); } catch { toast.error('Lỗi tải ảnh'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/admin/banners/${editing.id}`, form); toast.success('Cập nhật thành công'); }
      else { await api.post('/admin/banners', form); toast.success('Thêm thành công'); }
      setShowModal(false); fetch();
    } catch { toast.error('Lỗi'); }
  };

  const handleDelete = async (id) => { if (!window.confirm('Xóa banner?')) return; try { await api.delete(`/admin/banners/${id}`); toast.success('Đã xóa'); fetch(); } catch { toast.error('Lỗi'); } };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banner</h1>
        <button onClick={() => { setEditing(null); setForm({ title: '', image_url: '', link: '', position: 0 }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus size={16} /> Thêm</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {banners.map(b => (
          <div key={b.id} className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-[2/1] bg-gray-100">{b.image_url && <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />}</div>
            <div className="p-3 flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-900">{b.title}</p><p className="text-xs text-gray-500">Vị trí: {b.position}</p></div>
              <div className="flex gap-1"><button onClick={() => { setEditing(b); setForm({ title: b.title, image_url: b.image_url, link: b.link, position: b.position }); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button><button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Sửa banner' : 'Thêm banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>{form.image_url && <img src={form.image_url} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />}<input type="file" accept="image/*" onChange={handleUpload} className="text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Liên kết</label><input type="text" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label><input type="number" value={form.position} onChange={e => setForm({ ...form, position: parseInt(e.target.value) })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
              <div className="flex gap-2 pt-2"><button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">{editing ? 'Cập nhật' : 'Thêm'}</button><button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Hủy</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
