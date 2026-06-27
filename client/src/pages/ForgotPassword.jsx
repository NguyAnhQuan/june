import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi gửi email');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={28} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Email đã được gửi!</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Kiểm tra hộp thư <strong>{email}</strong> để xem link đặt lại mật khẩu (hiệu lực 30 phút).
                    </p>
                    <Link to="/login" className="text-indigo-600 text-sm font-medium hover:underline flex items-center justify-center gap-1">
                        <ArrowLeft size={14} /> Quay lại đăng nhập
                    </Link>
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
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Quên mật khẩu</h1>
                <p className="text-gray-500 text-sm mb-6">Nhập email để nhận link đặt lại mật khẩu</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
}
