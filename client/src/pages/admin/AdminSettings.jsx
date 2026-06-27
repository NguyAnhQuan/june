import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(res => setSettings(res.data)).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Lưu cấu hình thành công');
    } catch { toast.error('Lỗi lưu cấu hình'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  const fields = [
    { key: 'shop_name', label: 'Tên cửa hàng' },
    { key: 'shop_phone', label: 'Số điện thoại' },
    { key: 'shop_email', label: 'Email' },
    { key: 'shop_address', label: 'Địa chỉ' },
    { key: 'shipping_fee', label: 'Phí vận chuyển (VNĐ)' },
    { key: 'free_shipping_min', label: 'Miễn phí vận chuyển từ (VNĐ)' },
  ];

  const vnpayFields = [
    { key: 'vnpay_tmn_code', label: 'VNPay TMN Code' },
    { key: 'vnpay_hash_secret', label: 'VNPay Hash Secret', type: 'password' },
    { key: 'vnpay_url', label: 'VNPay URL' },
    { key: 'vnpay_return_url', label: 'VNPay Return URL' },
  ];


  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cấu hình hệ thống</h1>
      <form onSubmit={handleSave} className="max-w-lg space-y-8">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Thông tin cửa hàng</h2>
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type || 'text'} value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Cấu hình VNPay</h2>
          {vnpayFields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type || 'text'} value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
            </div>
          ))}
        </div>
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </form>
    </div>
  );

}
