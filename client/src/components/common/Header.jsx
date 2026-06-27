import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Bell, LogOut, Package, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

export default function Header() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const userMenuRef = useRef(null);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      {/* Top bar */}
      <div className="bg-brand-600 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</span>
          <span>Hotline: 0832 121 126</span>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-gray-900">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-wider text-brand-600 uppercase">
            June
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Trang chủ
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Sản phẩm <ChevronDown size={14} />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                  Tất cả sản phẩm
                </Link>
                {categories.map(cat => (
                  <Link key={cat.id} to={`/products?category=${cat.slug}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/posts" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Tin tức
            </Link>
            <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-64 pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none transition-colors"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user && (
              <Link to="/wishlist" className="hidden sm:flex p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Heart size={20} />
              </Link>
            )}

            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <User size={20} />
                  <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-md py-2 shadow-sm">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <User size={16} /> Tài khoản của tôi
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Package size={16} /> Đơn hàng
                    </Link>
                    <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Heart size={16} /> Yêu thích
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-50">
                        <MapPin size={16} /> Trang quản trị
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-50">
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-full transition-colors">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm sản phẩm..." className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none" />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></button>
              </div>
            </form>
            <nav className="space-y-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Trang chủ</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Tất cả sản phẩm</Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg pl-6">{cat.name}</Link>
              ))}
              <Link to="/posts" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Tin tức</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Liên hệ</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
