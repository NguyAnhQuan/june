import { useState } from 'react';
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Gửi liên hệ thành công');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi gửi liên hệ');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, title: 'Địa chỉ', detail: 'Số 085, Đường Hoàng Văn Thái, Tân Phong - Lai Châu', color: 'bg-blue-50 text-blue-600' },
    { icon: Phone, title: 'Điện thoại', detail: '0832 121 126', color: 'bg-green-50 text-green-600' },
    { icon: Mail, title: 'Email', detail: 'contact@june.vn', color: 'bg-brand-50 text-brand-600' },
    { icon: Clock, title: 'Giờ làm việc', detail: 'T2 - CN: 8:00 - 21:00', color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 border border-white/30 rounded-full" />
          <div className="absolute bottom-0 left-10 w-60 h-60 border border-white/20 rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Liên hệ với chúng tôi</h1>
          <p className="text-brand-100 max-w-lg mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin, đội ngũ June sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
              <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                <item.icon size={20} />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form + Map */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Gửi tin nhắn cho chúng tôi</h2>
              <p className="text-sm text-gray-500 mb-6">Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại sớm nhất</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition-colors"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition-colors"
                      placeholder="0832 121 126"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung *</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    required
                    rows={5}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none resize-none transition-colors"
                    placeholder="Nhập nội dung tin nhắn..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send size={16} /> Gửi tin nhắn</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Side info */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 sm:p-8 text-white h-full">
              <h3 className="text-lg font-bold mb-2">June Fashion</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Thời trang hiện đại, phong cách riêng biệt. June mang đến cho bạn những bộ sưu tập mới nhất với chất lượng tuyệt vời và giá cả hợp lý.
              </p>

              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5">Cửa hàng</p>
                    <a href="https://maps.app.goo.gl/A52AS6bcGsBJzL9n9" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-brand-400 transition-colors">Số 085, Đường Hoàng Văn Thái, Tân Phong - Lai Châu</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5">Hotline</p>
                    <p className="text-sm text-gray-400">0832 121 126</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5">Email</p>
                    <p className="text-sm text-gray-400">contact@june.vn</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <p className="text-sm font-medium mb-3">Theo dõi chúng tôi</p>
                <div className="flex gap-3">
                  {['Facebook', 'Instagram', 'TikTok'].map((name) => (
                    <span key={name} className="px-3 py-1.5 text-xs bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 cursor-pointer transition-colors">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
