import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../services/api';
import { formatPrice, formatDate, orderStatusText, orderStatusColor } from '../utils/format';
import Loading from '../components/common/Loading';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = filter ? `?status=${filter}` : '';
        const res = await api.get(`/orders${params}`);
        setOrders(res.data.orders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filter]);

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng của tôi</h1>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {[{ value: '', label: 'Tất cả' }, { value: 'pending', label: 'Chờ xác nhận' }, { value: 'confirmed', label: 'Đã xác nhận' }, { value: 'shipping', label: 'Đang giao' }, { value: 'completed', label: 'Hoàn thành' }, { value: 'cancelled', label: 'Đã hủy' }].map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)} className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${filter === s.value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} to={`/order/${order.id}`} className="block p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-medium text-gray-900">#{order.order_code}</span>
                  <span className="text-xs text-gray-400 ml-2">{formatDate(order.createdAt)}</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${orderStatusColor(order.order_status)}`}>
                  {orderStatusText(order.order_status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{order.items?.length} sản phẩm</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}