import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStock, setLowStock] = useState(false);

  useEffect(() => {
    const params = lowStock ? '?low_stock=true' : '';
    api.get(`/admin/reports/inventory${params}`).then(res => setInventory(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [lowStock]);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tồn kho</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowStock} onChange={e => { setLowStock(e.target.checked); setLoading(true); }} className="rounded border-gray-300" />
          Chỉ hiện sắp hết hàng
        </label>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-medium text-gray-600">Sản phẩm</th><th className="text-right p-3 font-medium text-gray-600">Tổng tồn</th><th className="text-left p-3 font-medium text-gray-600">Chi tiết biến thể</th></tr></thead>
          <tbody>
            {inventory.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{p.name}</td>
                <td className="p-3 text-right">
                  <span className={`font-medium ${p.totalStock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {p.totalStock}
                  </span>
                  {p.totalStock <= 10 && <AlertTriangle size={14} className="inline ml-1 text-red-500" />}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {p.variants?.map(v => (
                      <span key={v.id} className={`text-xs px-2 py-0.5 rounded ${v.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        {v.size}/{v.color}: {v.stock}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
