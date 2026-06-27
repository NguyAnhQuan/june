import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Đăng nhập thành công');
      if (data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex">
      {/* Left - Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-10 w-72 h-72 border border-white/30 rounded-full" />
          <div className="absolute bottom-20 right-10 w-96 h-96 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white/25 rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link to="/" className="text-4xl font-bold tracking-wider uppercase mb-6">June</Link>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Chào mừng bạn<br />quay trở lại
          </h2>
          <p className="text-brand-100 text-lg leading-relaxed max-w-md">
            Đăng nhập để trải nghiệm mua sắm thời trang với hàng nghìn sản phẩm chất lượng cao.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">1000+</p>
              <p className="text-sm text-brand-200">Sản phẩm</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">50K+</p>
              <p className="text-sm text-brand-200">Khách hàng</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">99%</p>
              <p className="text-sm text-brand-200">Hài lòng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden block text-center text-3xl font-bold tracking-wider text-brand-600 uppercase mb-2">June</Link>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Đăng nhập</h1>
          <p className="text-sm text-gray-500 text-center mb-8">Nhập thông tin tài khoản của bạn</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition-colors"
                  placeholder="Nhập mật khẩu"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">Quên mật khẩu?</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Đăng nhập <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-gray-400 uppercase tracking-wider">hoặc</span>
            </div>
          </div>

          <p className="text-sm text-center text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
