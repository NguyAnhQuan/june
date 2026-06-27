import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

const PROVINCE_API = 'https://provinces.open-api.vn/api';

export default function Checkout() {
  const { items, totalPrice, fetchCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', province: '', district: '', ward: '', detail: '' });
  const [showNewAddress, setShowNewAddress] = useState(false);

  // Province API states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const shippingFee = totalPrice >= 500000 ? 0 : 30000;
  const finalTotal = totalPrice - discount + shippingFee;

  useEffect(() => {
    api.get('/users/addresses').then(res => {
      setAddresses(res.data);
      const def = res.data.find(a => a.is_default) || res.data[0];
      if (def) setSelectedAddress(def);
    }).catch(() => {});
  }, []);

  // Load provinces
  useEffect(() => {
    if (showNewAddress && provinces.length === 0) {
      fetch(`${PROVINCE_API}/p/`)
        .then(res => res.json())
        .then(data => setProvinces(data))
        .catch(() => {});
    }
  }, [showNewAddress]);

  // Load districts when province changes
  useEffect(() => {
    if (!selectedProvince) { setDistricts([]); setWards([]); return; }
    fetch(`${PROVINCE_API}/p/${selectedProvince}?depth=2`)
      .then(res => res.json())
      .then(data => {
        setDistricts(data.districts || []);
        setNewAddress(prev => ({ ...prev, province: data.name, district: '', ward: '' }));
      })
      .catch(() => {});
    setSelectedDistrict('');
    setWards([]);
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (!selectedDistrict) { setWards([]); return; }
    fetch(`${PROVINCE_API}/d/${selectedDistrict}?depth=2`)
      .then(res => res.json())
      .then(data => {
        setWards(data.wards || []);
        setNewAddress(prev => ({ ...prev, district: data.name, ward: '' }));
      })
      .catch(() => {});
  }, [selectedDistrict]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/coupons/apply', { code: couponCode, subtotal: totalPrice });
      setDiscount(res.data.discount);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setDiscount(0);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.province || !newAddress.district || !newAddress.ward || !newAddress.detail) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }
    try {
      const res = await api.post('/users/addresses', { ...newAddress, is_default: addresses.length === 0 });
      setAddresses([...addresses, res.data.address]);
      setSelectedAddress(res.data.address);
      setShowNewAddress(false);
      setNewAddress({ name: '', phone: '', province: '', district: '', ward: '', detail: '' });
      setSelectedProvince('');
      setSelectedDistrict('');
      toast.success('Thêm địa chỉ thành công');
    } catch (error) {
      toast.error('Lỗi thêm địa chỉ');
    }
  };

  const handleOrder = async () => {
    if (!selectedAddress) { toast.error('Vui lòng chọn địa chỉ giao hàng'); return; }
    if (items.length === 0) { toast.error('Giỏ hàng trống'); return; }

    setLoading(true);
    try {
      const addressText = `${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`;
      const res = await api.post('/orders', {
        receiver_name: selectedAddress.name,
        receiver_phone: selectedAddress.phone,
        address: addressText,
        note,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
        shipping_fee: shippingFee,
      });

      if (paymentMethod === 'vnpay') {
        const payRes = await api.post('/payment/vnpay/create', { order_id: res.data.order.id });
        window.location.href = payRes.data.paymentUrl;
      } else {
        toast.success('Đặt hàng thành công');
        await fetchCart();
        navigate(`/order/${res.data.order.id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white appearance-none';
  const inputClass = 'px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Địa chỉ giao hàng</h3>
            {addresses.map(addr => (
              <label key={addr.id} className={`block p-4 border rounded-lg mb-2 cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-400'}`}>
                <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="sr-only" />
                <p className="text-sm font-medium text-gray-900">{addr.name} - {addr.phone}</p>
                <p className="text-sm text-gray-500 mt-0.5">{addr.detail}, {addr.ward}, {addr.district}, {addr.province}</p>
              </label>
            ))}
            {!showNewAddress ? (
              <button onClick={() => setShowNewAddress(true)} className="text-sm text-gray-600 hover:text-gray-900 underline">Thêm địa chỉ mới</button>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} placeholder="Họ tên *" className={inputClass} />
                  <input value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} placeholder="Số điện thoại *" className={inputClass} />
                </div>
                <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)} className={selectClass}>
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} disabled={!selectedProvince} className={`${selectClass} ${!selectedProvince ? 'bg-gray-50 text-gray-400' : ''}`}>
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                  <select value={newAddress.ward} onChange={e => setNewAddress({...newAddress, ward: e.target.value})} disabled={!selectedDistrict} className={`${selectClass} ${!selectedDistrict ? 'bg-gray-50 text-gray-400' : ''}`}>
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                  </select>
                </div>
                <input value={newAddress.detail} onChange={e => setNewAddress({...newAddress, detail: e.target.value})} placeholder="Số nhà, tên đường... *" className={`w-full ${inputClass}`} />
                <div className="flex gap-2">
                  <button onClick={handleAddAddress} className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600">Lưu</button>
                  <button onClick={() => { setShowNewAddress(false); setSelectedProvince(''); setSelectedDistrict(''); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Hủy</button>
                </div>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Phương thức thanh toán</h3>
            <label className={`block p-4 border rounded-lg mb-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
              <p className="text-sm font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</p>
            </label>
            <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'vnpay' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
              <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="sr-only" />
              <p className="text-sm font-medium text-gray-900">Thanh toán qua VNPay</p>
            </label>
          </div>

          {/* Note */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Ghi chú</h3>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Ghi chú cho đơn hàng (không bắt buộc)" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none" />
          </div>
        </div>

        {/* Right - Summary */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-lg p-5 sticky top-24">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Tóm tắt đơn hàng</h3>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                    {item.variant?.product?.name} ({item.variant?.size}/{item.variant?.color}) x{item.quantity}
                  </span>
                  <span className="text-gray-900 shrink-0">{formatPrice(Number(item.variant?.product?.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Mã giảm giá" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
              <button onClick={handleApplyCoupon} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Áp dụng</button>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Giảm giá</span>
                  <span className="text-green-600">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Tổng cộng</span>
                <span className="text-lg">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button onClick={handleOrder} disabled={loading} className="w-full mt-4 py-3 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors">
              {loading ? 'Đang xử lý...' : paymentMethod === 'vnpay' ? 'Thanh toán qua VNPay' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
