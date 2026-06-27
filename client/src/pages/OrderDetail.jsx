import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatPrice, formatDateTime, orderStatusText, orderStatusColor, paymentStatusText } from '../utils/format';
import Loading from '../components/common/Loading';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(res => setOrder(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Hủy đơn hàng thành công');
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hủy đơn hàng');
    }
  };

  if (loading) return <Loading />;
  if (!order) return <div className="text-center py-20 text-gray-500">Không tìm thấy đơn hàng</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.order_code}</h1>
          <p className="text-sm text-gray-500 mt-1">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${orderStatusColor(order.order_status)}`}>
          {orderStatusText(order.order_status)}
        </span>
      </div>

      {/* Items */}
      <div className="border border-gray-100 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Sản phẩm</h3>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden shrink-0">
                <img src={item.product_image || '/placeholder.jpg'} alt={item.product_name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                <p className="text-xs text-gray-500">{item.size} / {item.color} x{item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin giao hàng</h3>
          <p className="text-sm text-gray-700">{order.receiver_name}</p>
          <p className="text-sm text-gray-500">{order.receiver_phone}</p>
          <p className="text-sm text-gray-500 mt-1">{order.address}</p>
          {order.note && <p className="text-sm text-gray-400 mt-2 italic">Ghi chú: {order.note}</p>}
        </div>
        <div className="border border-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Thanh toán</h3>
          <p className="text-sm text-gray-700">{order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'VNPay'}</p>
          <p className="text-sm text-gray-500 mt-1">{paymentStatusText(order.payment_status)}</p>
          <div className="border-t border-gray-50 mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
            {Number(order.discount) > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Giảm giá</span><span className="text-green-600">-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-gray-500">Phí vận chuyển</span><span>{Number(order.shipping_fee) === 0 ? 'Miễn phí' : formatPrice(order.shipping_fee)}</span></div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-50"><span>Tổng cộng</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/orders" className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          Quay lại
        </Link>
        {order.order_status === 'pending' && (
          <button onClick={handleCancel} className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            Hủy đơn hàng
          </button>
        )}
      </div>
    </div>
  );
}