import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Tag, Image, Star, FileText, BarChart3, Warehouse, Settings, LogOut, Menu, X, ChevronLeft, MessageSquare, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';


const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan', exact: true },
  { path: '/admin/products', icon: Package, label: 'Sản phẩm' },
  { path: '/admin/categories', icon: FolderTree, label: 'Danh mục' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { path: '/admin/customers', icon: Users, label: 'Khách hàng' },
  { path: '/admin/coupons', icon: Tag, label: 'Mã giảm giá' },
  { path: '/admin/banners', icon: Image, label: 'Banner' },
  { path: '/admin/reviews', icon: Star, label: 'Đánh giá' },
  { path: '/admin/posts', icon: FileText, label: 'Bài viết' },
  { path: '/admin/contacts', icon: MessageSquare, label: 'Liên hệ' },
  { path: '/admin/rag-docs', icon: Bot, label: 'Chatbot / RAG' },
  { path: '/admin/revenue', icon: BarChart3, label: 'Doanh thu' },
  { path: '/admin/inventory', icon: Warehouse, label: 'Tồn kho' },
  { path: '/admin/settings', icon: Settings, label: 'Cấu hình' },
];


export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontSize: '14px' } }} />

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-900 to-indigo-950 transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-indigo-800">
          <Link to="/admin" className="text-lg font-bold tracking-wider text-white uppercase">
            June Admin
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-indigo-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 8rem)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white/15 text-white' : 'text-indigo-300 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-800">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-300 hover:text-white transition-colors mb-1">
            <ChevronLeft size={16} /> Về trang chủ
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
