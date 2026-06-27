import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { name, phone });
      updateUser(res.data.user);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      toast.error('Lỗi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Mật khẩu mới tối thiểu 6 ký tự'); return; }
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi đổi mật khẩu');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tài khoản của tôi</h1>

      <form onSubmit={handleUpdateProfile} className="space-y-4 mb-10">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Thông tin cá nhân</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Đổi mật khẩu</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" placeholder="Tối thiểu 6 ký tự" />
        </div>
        <button type="submit" className="px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
}