import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatPrice } from '../utils/format';
import Loading from '../components/common/Loading';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(res => setItems(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setItems(items.filter(i => i.id !== id));
      toast.success('Đã xóa khỏi yêu thích');
    } catch (error) {
      toast.error('Lỗi xóa');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Danh sách yêu thích</h1>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Chưa có sản phẩm yêu thích</p>
          <Link to="/products" className="inline-block px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">Khám phá sản phẩm</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group">
              <Link to={`/product/${item.product?.slug}`} className="block">
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                  <img src={item.product?.images?.[0]?.image_url || '/placeholder.jpg'} alt={item.product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mt-2 line-clamp-2">{item.product?.name}</h3>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(item.product?.price)}</p>
              </Link>
              <button onClick={() => handleRemove(item.id)} className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}