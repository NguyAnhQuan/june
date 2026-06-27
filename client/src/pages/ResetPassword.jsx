import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [form, setForm] = useState({ password: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Mật khẩu tối thiểu 6 ký tự');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, password: form.password });
            toast.success('Đặt lại mật khẩu thành công!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Link không hợp lệ</p>
                    <Link to="/forgot-password" className="text-indigo-600 text-sm hover:underline">Yêu cầu link mới</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
                <Link to="/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
                    <ArrowLeft size={14} /> Quay lại đăng nhập
                </Link>
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Lock size={22} className="text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Đặt lại mật khẩu</h1>
                <p className="text-gray-500 text-sm mb-6">Nhập mật khẩu mới cho tài khoản của bạn</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                            placeholder="Tối thiểu 6 ký tự"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            value={form.confirm}
                            onChange={e => setForm({ ...form, confirm: e.target.value })}
                            required
                            placeholder="Nhập lại mật khẩu"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
}
