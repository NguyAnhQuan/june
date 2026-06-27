import { useState, useEffect } from 'react';
import { Star, Check, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/format';
import Loading from '../../components/common/Loading';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => { api.get('/admin/reviews').then(res => setReviews(res.data.reviews)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id, approved) => { try { await api.put(`/admin/reviews/${id}`, { is_approved: approved }); toast.success(approved ? 'Đã duyệt' : 'Đã ẩn'); fetch(); } catch { toast.error('Lỗi'); } };
  const handleDelete = async (id) => { if (!window.confirm('Xóa đánh giá?')) return; try { await api.delete(`/admin/reviews/${id}`); toast.success('Đã xóa'); fetch(); } catch { toast.error('Lỗi'); } };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá</h1>
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-medium text-gray-600">Khách hàng</th><th className="text-left p-3 font-medium text-gray-600">Sản phẩm</th><th className="text-center p-3 font-medium text-gray-600">Sao</th><th className="text-left p-3 font-medium text-gray-600">Bình luận</th><th className="text-center p-3 font-medium text-gray-600">Trạng thái</th><th className="text-center p-3 font-medium text-gray-600">Thao tác</th></tr></thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-3 text-gray-900">{r.user?.name}</td>
                <td className="p-3 text-gray-500">{r.product?.name}</td>
                <td className="p-3 text-center"><div className="flex items-center justify-center gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />)}</div></td>
                <td className="p-3 text-gray-600 max-w-xs truncate">{r.comment}</td>
                <td className="p-3 text-center"><span className={`text-xs px-2 py-1 rounded-full ${r.is_approved ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{r.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}</span></td>
                <td className="p-3"><div className="flex justify-center gap-1">
                  {!r.is_approved && <button onClick={() => handleApprove(r.id, true)} className="p-1.5 text-gray-400 hover:text-green-600"><Check size={15} /></button>}
                  {r.is_approved && <button onClick={() => handleApprove(r.id, false)} className="p-1.5 text-gray-400 hover:text-yellow-600"><X size={15} /></button>}
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
