import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function VnpayReturn() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const params = Object.fromEntries(searchParams);
        const res = await api.get('/payment/vnpay/return', { params });
        setResult(res.data);
      } catch (error) {
        setResult({ success: false, message: 'Lỗi xác minh thanh toán' });
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [searchParams]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {result?.success ? (
        <>
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công</h1>
          <p className="text-gray-500 mb-6">Đơn hàng #{result.order_code} đã được thanh toán thành công qua VNPay</p>
          <Link to="/orders" className="inline-block px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">Xem đơn hàng</Link>
        </>
      ) : (
        <>
          <XCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
          <p className="text-gray-500 mb-6">{result?.message || 'Đã xảy ra lỗi khi thanh toán'}</p>
          <Link to="/orders" className="inline-block px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">Xem đơn hàng</Link>
        </>
      )}
    </div>
  );
}