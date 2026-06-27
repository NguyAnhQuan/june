import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-brand-400 tracking-wider uppercase mb-4">June</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Thời trang hiện đại, phong cách riêng biệt. June mang đến cho bạn những bộ sưu tập mới nhất với chất lượng tuyệt vời.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Liên kết</h4>
            <ul className="space-y-2.5">
              <li><Link to="/products" className="text-sm text-gray-400 hover:text-brand-400 transition-colors">Sản phẩm</Link></li>
              <li><Link to="/posts" className="text-sm text-gray-400 hover:text-brand-400 transition-colors">Tin tức</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-400 hover:text-brand-400 transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Hỗ trợ</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-gray-400">Chính sách đổi trả</span></li>
              <li><span className="text-sm text-gray-400">Hướng dẫn mua hàng</span></li>
              <li><span className="text-sm text-gray-400">Chính sách bảo mật</span></li>
              <li><span className="text-sm text-gray-400">Điều khoản sử dụng</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-400" />
                <a href="https://maps.app.goo.gl/A52AS6bcGsBJzL9n9" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-brand-400 transition-colors">Số 085, Đường Hoàng Văn Thái, Tân Phong - Lai Châu</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-brand-400" />
                <span className="text-sm text-gray-400">0832 121 126</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-brand-400" />
                <span className="text-sm text-gray-400">contact@june.vn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-gray-500">
            &copy; 2026 June Fashion. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
