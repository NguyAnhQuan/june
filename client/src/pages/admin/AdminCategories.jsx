import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', image: '' });

  const fetchCategories = () => {
    api.get('/admin/categories').then(res => { setCategories(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, form);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await api.post('/admin/categories', form);
        toast.success('Thêm danh mục thành công');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error('Lỗi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try { await api.delete(`/admin/categories/${id}`); toast.success('Đã xóa'); fetchCategories(); } catch { toast.error('Lỗi xóa'); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', image: '' }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus size={16} /> Thêm</button>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50"><th className="text-left p-3 font-medium text-gray-600">Tên</th><th className="text-left p-3 font-medium text-gray-600">Slug</th><th className="text-center p-3 font-medium text-gray-600">Trạng thái</th><th className="text-center p-3 font-medium text-gray-600">Thao tác</th></tr></thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{c.name}</td>
                <td className="p-3 text-gray-500">{c.slug}</td>
                <td className="p-3 text-center"><span className={`text-xs px-2 py-1 rounded-full ${c.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{c.is_active ? 'Hiện' : 'Ẩn'}</span></td>
                <td className="p-3"><div className="flex justify-center gap-1"><button onClick={() => { setEditing(c); setForm({ name: c.name, image: c.image || '' }); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button><button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" /></div>
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">{editing ? 'Cập nhật' : 'Thêm'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
