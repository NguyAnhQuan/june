import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', original_price: '', category_id: '', brand: '', images: [], variants: [{ size: 'M', color: 'Đen', stock: 50, sku: '' }] });
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await api.get(`/admin/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { api.get('/admin/categories').then(res => setCategories(res.data)).catch(() => {}); }, []);

  const handleSearch = (e) => { e.preventDefault(); setLoading(true); fetchProducts(1); };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) formData.append('images', files[i]);
      const res = await api.post('/upload/multiple', formData, { headers: { 'Content-Type': undefined } });
      setForm({ ...form, images: [...form.images, ...res.data.urls] });
      toast.success('Tải ảnh thành công');
    } catch (error) {
      toast.error('Lỗi tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '28', '29', '30', '31', '32', '34', '36', 'Free Size'];
  const COLOR_OPTIONS = ['Đen', 'Trắng', 'Xám', 'Navy', 'Be', 'Nâu', 'Xanh dương', 'Xanh rêu', 'Đỏ', 'Hồng', 'Vàng', 'Cam', 'Tím', 'Kem'];

  const generateSKU = (name, size, color) => {
    const nameCode = (name || 'SP').split(' ').map(w => w.charAt(0).toUpperCase()).join('').slice(0, 4);
    const sizeCode = (size || '').replace(/\s/g, '').toUpperCase().slice(0, 3);
    const colorMap = { 'Đen': 'BLK', 'Trắng': 'WHT', 'Xám': 'GRY', 'Navy': 'NAV', 'Be': 'BEI', 'Nâu': 'BRN', 'Xanh dương': 'BLU', 'Xanh rêu': 'GRN', 'Đỏ': 'RED', 'Hồng': 'PNK', 'Vàng': 'YLW', 'Cam': 'ORG', 'Tím': 'PUR', 'Kem': 'CRM' };
    const colorCode = colorMap[color] || (color || '').slice(0, 3).toUpperCase();
    return `${nameCode}-${sizeCode}-${colorCode}`;
  };

  const handleAddVariant = () => {
    setForm({ ...form, variants: [...form.variants, { size: 'M', color: 'Đen', stock: 50, sku: generateSKU(form.name, 'M', 'Đen') }] });
  };

  const handleVariantChange = (idx, field, value) => {
    const variants = [...form.variants];
    variants[idx][field] = value;
    if (field === 'size' || field === 'color') {
      variants[idx].sku = generateSKU(form.name, variants[idx].size, variants[idx].color);
    }
    setForm({ ...form, variants });
  };

  const handleRemoveVariant = (idx) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name, description: product.description || '', price: product.price, original_price: product.original_price || '',
      category_id: product.category_id, brand: product.brand || '',
      images: product.images?.map(img => img.image_url) || [],
      variants: product.variants?.map(v => ({ size: v.size, color: v.color, stock: v.stock, sku: v.sku || '' })) || [],
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', original_price: '', category_id: categories[0]?.id || '', brand: '', images: [], variants: [{ size: 'M', color: 'Đen', stock: 50, sku: 'SP-M-BLK' }] });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), original_price: Number(form.original_price) || 0, category_id: Number(form.category_id), variants: form.variants.map(v => ({ ...v, stock: Number(v.stock) })) };
      if (editing) {
        await api.put(`/admin/products/${editing.id}`, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Thêm sản phẩm thành công');
      }
      setShowModal(false);
      fetchProducts(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Xóa sản phẩm thành công');
      fetchProducts(pagination.page);
    } catch (error) {
      toast.error('Lỗi xóa sản phẩm');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm sản phẩm..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </form>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-600">Sản phẩm</th>
                <th className="text-left p-3 font-medium text-gray-600">Danh mục</th>
                <th className="text-right p-3 font-medium text-gray-600">Giá</th>
                <th className="text-right p-3 font-medium text-gray-600">Tồn kho</th>
                <th className="text-right p-3 font-medium text-gray-600">Đã bán</th>
                <th className="text-center p-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const totalStock = p.variants?.reduce((s, v) => s + v.stock, 0) || 0;
                const img = p.images?.find(i => i.is_primary) || p.images?.[0];
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                          {img && <img src={img.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">{p.category?.name}</td>
                    <td className="p-3 text-right font-medium">{formatPrice(p.price)}</td>
                    <td className="p-3 text-right">{totalStock}</td>
                    <td className="p-3 text-right">{p.sold_count}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={p => { setLoading(true); fetchProducts(p); }} />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 my-8 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => { const name = e.target.value; setForm(prev => ({ ...prev, name, variants: prev.variants.map(v => ({ ...v, sku: generateSKU(name, v.size, v.color) })) })); }} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VNĐ)</label>
                  <input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                  <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400">
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                  <input type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none" />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm({...form, images: form.images.filter((_, idx) => idx !== i)})} className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-bl">x</button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" multiple onChange={handleUpload} className="text-sm" />
                {uploading && <p className="text-xs text-gray-500 mt-1">Đang tải ảnh...</p>}
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Biến thể (size/màu/tồn kho)</label>
                  <button type="button" onClick={handleAddVariant} className="text-xs text-blue-600 hover:underline">+ Thêm biến thể</button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_80px_1fr_28px] gap-2 text-xs font-medium text-gray-400 px-1">
                    <span>Size</span><span>Màu sắc</span><span>Tồn kho</span><span>SKU</span><span></span>
                  </div>
                  {form.variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_80px_1fr_28px] gap-2 items-center">
                      <select value={v.size} onChange={e => handleVariantChange(idx, 'size', e.target.value)} className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-white">
                        {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select value={v.color} onChange={e => handleVariantChange(idx, 'color', e.target.value)} className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-white">
                        {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input type="number" value={v.stock} onChange={e => handleVariantChange(idx, 'stock', e.target.value)} placeholder="0" className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg" />
                      <input type="text" value={v.sku} readOnly className="px-2 py-1.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-500" />
                      {form.variants.length > 1 && (
                        <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  {editing ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
