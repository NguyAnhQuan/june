import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';
import Loading from '../../components/common/Loading';


export default function AdminRevenue() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get(`/admin/reports/revenue?period=month&year=${year}`).then(res => setData(res.data)).catch(() => { }).finally(() => setLoading(false));
  }, [year]);

  const handleExport = () => {
    const token = localStorage.getItem('token');
    const url = `${api.defaults.baseURL}/admin/reports/revenue/export?year=${year}`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `doanh-thu-${year}.xlsx`);
    // Pass token via query for download links
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      });
  };

  if (loading) return <Loading />;


  const maxRevenue = Math.max(...data.map(d => Number(d.revenue) || 0), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo doanh thu</h1>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => { setYear(e.target.value); setLoading(true); }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
            <Download size={15} /> Xuất Excel
          </button>
        </div>

      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-6">
        <div className="flex items-end gap-2 h-64">
          {Array.from({ length: 12 }, (_, i) => {
            const monthData = data.find(d => Number(d.month) === i + 1);
            const revenue = Number(monthData?.revenue || 0);
            const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500">{revenue > 0 ? formatPrice(revenue) : ''}</span>
                <div className="w-full bg-gray-100 rounded-t" style={{ height: '200px', position: 'relative' }}>
                  <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t transition-all duration-500" style={{ height: `${height}%` }} />
                </div>
                <span className="text-xs text-gray-500">T{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-medium text-gray-600">Tháng</th><th className="text-right p-3 font-medium text-gray-600">Doanh thu</th><th className="text-right p-3 font-medium text-gray-600">Số đơn</th></tr></thead>
          <tbody>
            {data.map(d => (
              <tr key={d.month} className="border-b border-gray-50"><td className="p-3 text-gray-900">Tháng {d.month}</td><td className="p-3 text-right font-medium">{formatPrice(d.revenue)}</td><td className="p-3 text-right text-gray-500">{d.orders}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
