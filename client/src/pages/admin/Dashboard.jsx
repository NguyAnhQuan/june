import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/format';
import Loading from '../../components/common/Loading';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  const stats = [
    { label: 'Doanh thu tháng', value: formatPrice(data.monthRevenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Đơn hàng tháng', value: data.monthOrders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
    { label: 'Đơn chờ xác nhận', value: data.pendingOrders, icon: Package, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Khách hàng mới', value: data.newCustomers, icon: Users, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-5 bg-white border border-gray-100 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{s.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}><Icon size={18} /></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Đơn hàng gần đây</h3>
            <Link to="/admin/orders" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">Xem tất cả <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders?.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{order.order_code}</p>
                  <p className="text-xs text-gray-400">{order.user?.name} - {formatDate(order.createdAt)}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatPrice(order.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm bán chạy</h3>
          <div className="space-y-3">
            {data.topProducts?.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-xs font-medium text-indigo-600 flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm text-gray-900">{p.name}</span>
                </div>
                <span className="text-sm text-gray-500">Đã bán {p.sold_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
