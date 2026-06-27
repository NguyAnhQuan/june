import { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, formatDate, orderStatusText, orderStatusColor } from '../../utils/format';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await api.get(`/admin/orders?${params}`);
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [status]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { order_status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders(pagination.page);
      if (selected?.id === id) {
        const res = await api.get(`/admin/orders/${id}`);
        setSelected(res.data);
      }
    } catch (error) {
      toast.error('Lỗi cập nhật');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {[{ v: '', l: 'Tất cả' }, { v: 'pending', l: 'Chờ xác nhận' }, { v: 'confirmed', l: 'Đã xác nhận' }, { v: 'shipping', l: 'Đang giao' }, { v: 'completed', l: 'Hoàn thành' }, { v: 'cancelled', l: 'Đã hủy' }].map(s => (
          <button key={s.v} onClick={() => { setStatus(s.v); setLoading(true); }} className={`px-3 py-1.5 text-sm rounded-full ${status === s.v ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.l}</button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left p-3 font-medium text-gray-600">Mã đơn</th>
              <th className="text-left p-3 font-medium text-gray-600">Khách hàng</th>
              <th className="text-right p-3 font-medium text-gray-600">Tổng tiền</th>
              <th className="text-center p-3 font-medium text-gray-600">Trạng thái</th>
              <th className="text-center p-3 font-medium text-gray-600">Ngày đặt</th>
              <th className="text-center p-3 font-medium text-gray-600">Thao tác</th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">#{o.order_code}</td>
                  <td className="p-3 text-gray-600">{o.user?.name}</td>
                  <td className="p-3 text-right font-medium">{formatPrice(o.total)}</td>
                  <td className="p-3 text-center"><span className={`text-xs font-medium px-2 py-1 rounded-full ${orderStatusColor(o.order_status)}`}>{orderStatusText(o.order_status)}</span></td>
                  <td className="p-3 text-center text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={async () => { const res = await api.get(`/admin/orders/${o.id}`); setSelected(res.data); }} className="p-1.5 text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                      {o.order_status === 'pending' && <button onClick={() => handleUpdateStatus(o.id, 'confirmed')} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Xác nhận</button>}
                      {o.order_status === 'confirmed' && <button onClick={() => handleUpdateStatus(o.id, 'shipping')} className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100">Giao hàng</button>}
                      {o.order_status === 'shipping' && <button onClick={() => handleUpdateStatus(o.id, 'completed')} className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100">Hoàn thành</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={p => { setLoading(true); fetchOrders(p); }} />

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-xl mx-4 my-8 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Đơn hàng #{selected.order_code}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-500">Khách hàng:</span> {selected.user?.name} ({selected.user?.email})</p>
              <p><span className="text-gray-500">Người nhận:</span> {selected.receiver_name} - {selected.receiver_phone}</p>
              <p><span className="text-gray-500">Địa chỉ:</span> {selected.address}</p>
              <p><span className="text-gray-500">Thanh toán:</span> {selected.payment_method === 'cod' ? 'COD' : 'VNPay'} - {selected.payment_status}</p>
              <div className="border-t border-gray-100 pt-3">
                {selected.items?.map(item => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>{item.product_name} ({item.size}/{item.color}) x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2 mt-2 font-semibold flex justify-between">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(selected.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
