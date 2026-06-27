import { useState, useEffect } from 'react';
import { Mail, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/format';
import Loading from '../../components/common/Loading';

export default function AdminContacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const fetch = () => {
        api.get('/admin/contacts').then(res => setContacts(res.data)).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(() => { fetch(); }, []);

    const handleRead = async (id) => {
        try {
            await api.put(`/admin/contacts/${id}/read`);
            fetch();
        } catch { toast.error('Lỗi'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa liên hệ này?')) return;
        try {
            await api.delete(`/admin/contacts/${id}`);
            toast.success('Đã xóa');
            if (selected?.id === id) setSelected(null);
            fetch();
        } catch { toast.error('Lỗi xóa'); }
    };

    if (loading) return <Loading />;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Liên hệ & Phản hồi</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* List */}
                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-lg overflow-hidden">
                    {contacts.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">Chưa có liên hệ nào</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {contacts.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => { setSelected(c); if (!c.is_read) handleRead(c.id); }}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-indigo-50 border-l-2 border-indigo-600' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className={`text-sm truncate ${!c.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{c.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{c.email}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.createdAt)}</p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            {!c.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1" />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{c.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail */}
                <div className="lg:col-span-2">
                    {selected ? (
                        <div className="bg-white border border-gray-100 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                                    <p className="text-sm text-gray-500">{selected.email} {selected.phone && `• ${selected.phone}`}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(selected.createdAt)}</p>
                                </div>
                                <button onClick={() => handleDelete(selected.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                                {selected.message}
                            </div>
                            {selected.is_read && (
                                <div className="flex items-center gap-1 mt-3 text-xs text-green-600">
                                    <Check size={12} /> Đã đọc
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-lg p-12 text-center text-gray-400">
                            <Mail size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Chọn một liên hệ để xem chi tiết</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
