import { useState, useEffect } from 'react';
import { Search, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/format';
import Loading from '../../components/common/Loading';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = (s = '') => {
    const params = s ? `?search=${s}` : '';
    api.get(`/admin/customers${params}`).then(res => setCustomers(res.data.customers)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const toggleStatus = async (id) => {
    try {
      const res = await api.put(`/admin/customers/${id}/toggle-status`);
      toast.success(res.data.message);
      fetch(search);
    } catch { toast.error('Lỗi'); }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Khách hàng</h1>
      <form onSubmit={e => { e.preventDefault(); setLoading(true); fetch(search); }} className="mb-6">
        <div className="relative max-w-sm">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </form>
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-medium text-gray-600">Tên</th><th className="text-left p-3 font-medium text-gray-600">Email</th><th className="text-left p-3 font-medium text-gray-600">SĐT</th><th className="text-center p-3 font-medium text-gray-600">Ngày tạo</th><th className="text-center p-3 font-medium text-gray-600">Trạng thái</th><th className="text-center p-3 font-medium text-gray-600">Thao tác</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{c.name}</td>
                <td className="p-3 text-gray-500">{c.email}</td>
                <td className="p-3 text-gray-500">{c.phone || '-'}</td>
                <td className="p-3 text-center text-gray-500">{formatDate(c.createdAt)}</td>
                <td className="p-3 text-center"><span className={`text-xs px-2 py-1 rounded-full ${c.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{c.is_active ? 'Hoạt động' : 'Đã khóa'}</span></td>
                <td className="p-3 text-center"><button onClick={() => toggleStatus(c.id)} className="p-1.5 text-gray-400 hover:text-gray-700">{c.is_active ? <Lock size={15} /> : <Unlock size={15} />}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
