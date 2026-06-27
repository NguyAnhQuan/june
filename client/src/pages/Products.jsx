import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('limit', '12');
        if (category) params.set('category', category);
        if (search) params.set('search', search);
        if (sort) params.set('sort', sort);

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, search, sort, page]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Kết quả tìm kiếm: "${search}"` : category ? categories.find(c => c.slug === category)?.name || 'Sản phẩm' : 'Tất cả sản phẩm'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total} sản phẩm</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-400">
            <option value="newest">Mới nhất</option>
            <option value="best_selling">Bán chạy</option>
            <option value="price_asc">Giá thấp đến cao</option>
            <option value="price_desc">Giá cao đến thấp</option>
          </select>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg">
            <SlidersHorizontal size={16} /> Lọc
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} lg:block lg:static lg:w-56 lg:shrink-0`}>
          <div className="flex items-center justify-between lg:hidden mb-4">
            <h3 className="font-semibold">Bộ lọc</h3>
            <button onClick={() => setFiltersOpen(false)}><X size={20} /></button>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Danh mục</h4>
            <div className="space-y-2">
              <button onClick={() => updateParam('category', '')} className={`block text-sm w-full text-left py-1 ${!category ? 'text-brand-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                Tất cả
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => { updateParam('category', cat.slug); setFiltersOpen(false); }} className={`block text-sm w-full text-left py-1 ${category === cat.slug ? 'text-brand-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => updateParam('page', p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}