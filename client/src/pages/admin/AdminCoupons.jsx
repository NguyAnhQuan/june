import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/format';
import Loading from '../../components/common/Loading';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', discount_type: 'percent', discount_value: '', min_order: '0', max_discount: '0', start_date: '', end_date: '', usage_limit: '0' });

  const fetch = () => { api.get('/admin/coupons').then(res => setCoupons(res.data)).catch(() => { }).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/admin/coupons/${editing.id}`, form); toast.success('Cập nhật thành công'); }
      else { await api.post('/admin/coupons', form); toast.success('Tạo mã thành công'); }
      setShowModal(false); fetch();
    } catch (error) { toast.error(error.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa mã này?')) return;
    try { await api.delete(`/admin/coupons/${id}`); toast.success('Đã xóa'); fetch(); } catch { toast.error('Lỗi'); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
        <button onClick={() => { setEditing(null); setForm({ code: '', discount_type: 'percent', discount_value: '', min_order: '0', max_discount: '0', start_date: '', end_date: '', usage_limit: '0' }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"><Plus size={16} /> Tạo mã</button>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-medium text-gray-600">Mã</th><th className="text-center p-3 font-medium text-gray-600">Loại</th><th className="text-right p-3 font-medium text-gray-600">Giá trị</th><th className="text-center p-3 font-medium text-gray-600">Sử dụng</th><th className="text-center p-3 font-medium text-gray-600">Hạn</th><th className="text-center p-3 font-medium text-gray-600">Thao tác</th></tr></thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium font-mono text-gray-900">{c.code}</td>
                <td className="p-3 text-center text-gray-500">{c.discount_type === 'percent' ? 'Phần trăm' : 'Cố định'}</td>
                <td className="p-3 text-right">{c.discount_type === 'percent' ? `${c.discount_value}%` : formatPrice(c.discount_value)}</td>
                <td className="p-3 text-center text-gray-500">{c.used_count}/{c.usage_limit || '\u221E'}</td>
                <td className="p-3 text-center text-gray-500">{formatDate(c.end_date)}</td>
                <td className="p-3"><div className="flex justify-center gap-1"><button onClick={() => { setEditing(c); setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, min_order: c.min_order, max_discount: c.max_discount, start_date: c.start_date?.split('T')[0], end_date: c.end_date?.split('T')[0], usage_limit: c.usage_limit }); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button><button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Mã code <span className="text-red-500">*</span></label><input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm</label><select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"><option value="percent">Phần trăm (%)</option><option value="fixed">Cố định (VNĐ)</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Giá trị <span className="text-red-500">*</span></label><input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu</label><input type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa</label><input type="number" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu <span className="text-red-500">*</span></label><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc <span className="text-red-500">*</span></label><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn sử dụng (0 = không giới hạn)</label><input type="number" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
              <div className="flex gap-2 pt-2"><button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">{editing ? 'Cập nhật' : 'Tạo'}</button><button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Hủy</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
