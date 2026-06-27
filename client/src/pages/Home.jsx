import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import Loading from '../components/common/Loading';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, featuredRes, newestRes, catsRes] = await Promise.all([
          api.get('/banners'),
          api.get('/products?sort=best_selling&limit=8'),
          api.get('/products?sort=newest&limit=8'),
          api.get('/categories'),
        ]);
        const allBanners = bannersRes.data;
        setBanners(allBanners.filter(b => b.position <= 9));
        setPromoBanners(allBanners.filter(b => b.position >= 10));
        setFeatured(featuredRes.data.products);
        setNewest(newestRes.data.products);
        setCategories(catsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (loading) return <Loading />;

  return (
    <div>
      {/* Banner Slider */}
      {banners.length > 0 && (
        <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-gray-100">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide">{banner.title}</h2>
                  {banner.link && (
                    <Link to={banner.link} className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-brand-500 text-white text-sm font-medium rounded-full hover:bg-brand-600 transition-colors">
                      Khám phá ngay <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <>
              <button onClick={() => setCurrentBanner(prev => prev === 0 ? banners.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentBanner(prev => (prev + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors">
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentBanner(idx)} className={`w-2 h-2 rounded-full transition-colors ${idx === currentBanner ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Danh mục sản phẩm</h2>
          <div className="w-12 h-1 bg-brand-500 mx-auto rounded-full mb-8"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="group relative overflow-hidden rounded-lg aspect-[4/5]">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Best selling */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bán chạy nhất</h2>
            <Link to="/products?sort=best_selling" className="text-sm font-medium text-brand-500 hover:text-brand-700 flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Banner quảng cáo phụ */}
      {promoBanners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className={`grid gap-4 ${promoBanners.length === 1 ? 'grid-cols-1' : promoBanners.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {promoBanners.map(banner => (
              <Link key={banner.id} to={banner.link || '/products'} className="group relative overflow-hidden rounded-lg aspect-[16/9]">
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-bold text-white">{banner.title}</h3>
                  <span className="inline-flex items-center gap-1 mt-2 text-sm text-white/80 group-hover:text-white transition-colors">
                    Xem ngay <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newest */}
      {newest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sản phẩm mới</h2>
            <Link to="/products?sort=newest" className="text-sm font-medium text-brand-500 hover:text-brand-700 flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newest.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA cuối trang */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Đăng ký nhận ưu đãi</h2>
          <p className="text-brand-100 mb-8 max-w-md mx-auto">Nhận thông tin khuyến mãi và bộ sưu tập mới nhất từ June Fashion</p>
          <div className="flex max-w-md mx-auto">
            <input type="email" placeholder="Nhập email của bạn" className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/40" />
            <button className="px-6 py-3 bg-white text-brand-700 text-sm font-medium rounded-r-lg hover:bg-brand-50 transition-colors">
              Đăng ký
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
