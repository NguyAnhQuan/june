import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import Loading from '../components/common/Loading';

export default function Cart() {
  const { items, loading, totalPrice, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng</h2>
        <p className="text-gray-500 mb-6">Vui lòng đăng nhập để xem giỏ hàng</p>
        <Link to="/login" className="inline-block px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">Đăng nhập</Link>
      </div>
    );
  }

  if (loading) return <Loading />;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Link to="/products" className="inline-block px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Giỏ hàng ({items.length})</h1>

      <div className="space-y-4 mb-8">
        {items.map(item => {
          const product = item.variant?.product;
          const image = product?.images?.[0]?.image_url;
          return (
            <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img src={image || '/placeholder.jpg'} alt={product?.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product?.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.variant?.size} / {item.variant?.color}</p>
                <p className="text-sm font-semibold text-brand-600 mt-1">{formatPrice(product?.price)}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                <div className="flex items-center border border-gray-200 rounded">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-gray-500 hover:text-gray-900"><Minus size={14} /></button>
                  <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-gray-500 hover:text-gray-900"><Plus size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Tạm tính</span>
          <span className="text-lg font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex gap-3">
          <Link to="/products" className="flex-1 py-3 text-center text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Tiếp tục mua sắm
          </Link>
          <Link to="/checkout" className="flex-1 py-3 text-center text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
}