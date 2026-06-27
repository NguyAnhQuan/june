import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Minus, Plus, ChevronRight, Package, RefreshCw, Shield, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, formatDate } from '../utils/format';
import Loading from '../components/common/Loading';

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} className={s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg: 0, total: 0 });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/slug/${slug}`);
        const p = res.data;
        setProduct(p);
        const sizes = [...new Set(p.variants?.map(v => v.size))];
        const colors = [...new Set(p.variants?.map(v => v.color))];
        if (sizes.length > 0) setSelectedSize(sizes[0]);
        if (colors.length > 0) setSelectedColor(colors[0]);
        setSelectedImage(0);

        // Fetch related
        if (p.category?.slug) {
          const relRes = await api.get(`/products?category=${p.category.slug}&limit=5`);
          setRelatedProducts(relRes.data.products?.filter(rp => rp.id !== p.id).slice(0, 4) || []);
        }

        // Fetch reviews
        const revRes = await api.get(`/reviews/product/${p.id}`).catch(() => ({ data: { reviews: [], avgRating: 0, totalReviews: 0 } }));
        setReviews(revRes.data.reviews || []);
        setReviewStats({ avg: revRes.data.avgRating || 0, total: revRes.data.totalReviews || 0 });

        // Check wishlist
        if (user) {
          const wRes = await api.get('/wishlist').catch(() => ({ data: [] }));
          setWishlist(wRes.data?.some(w => w.product_id === p.id));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, user]);

  const handleSubmitReview = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập để đánh giá'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { product_id: product.id, rating: reviewRating, comment: reviewComment });
      toast.success('Đánh giá thành công! Đang chờ duyệt.');
      setReviewComment('');
      setReviewRating(5);
      // Refresh reviews
      const revRes = await api.get(`/reviews/product/${product.id}`);
      setReviews(revRes.data.reviews || []);
      setReviewStats({ avg: revRes.data.avgRating || 0, total: revRes.data.totalReviews || 0 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loading />;
  if (!product) return (
    <div className="text-center py-32">
      <Package size={48} className="mx-auto text-gray-200 mb-4" />
      <p className="text-gray-500">Không tìm thấy sản phẩm</p>
    </div>
  );

  const sizes = [...new Set(product.variants?.map(v => v.size))];
  const colors = [...new Set(product.variants?.map(v => v.color))];
  const selectedVariant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
  const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price);
  const discountPercent = hasDiscount ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) : 0;
  const avgRating = reviewStats.avg;

  const handleAddToCart = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng'); return; }
    if (!selectedVariant) { toast.error('Vui lòng chọn kích cỡ và màu sắc'); return; }
    if (selectedVariant.stock < quantity) { toast.error('Sản phẩm không đủ số lượng'); return; }
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, quantity);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập'); return; }
    try {
      const res = await api.post('/wishlist', { product_id: product.id });
      setWishlist(res.data.wishlisted);
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Lỗi cập nhật yêu thích');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-gray-900 transition-colors">Sản phẩm</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-14">
          {/* === IMAGES === */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 group">
              <img
                src={product.images?.[selectedImage]?.image_url || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discountPercent}%
                </div>
              )}
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 ${wishlist
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-white border-gray-200 text-gray-400 hover:text-brand-500 hover:border-brand-300'
                  }`}
              >
                <Heart size={17} className={wishlist ? 'fill-white' : ''} />
              </button>
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${idx === selectedImage ? 'border-brand-500' : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* === INFO === */}
          <div className="flex flex-col">
            {/* Brand / category */}
            <div className="flex items-center gap-2 mb-2">
              {product.brand && (
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                  {product.brand}
                </span>
              )}
              {product.brand && product.category && <span className="text-gray-300">·</span>}
              {product.category && (
                <Link to={`/products?category=${product.category.slug}`} className="text-xs text-gray-400 hover:text-gray-600">
                  {product.category.name}
                </Link>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-snug">{product.name}</h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={avgRating} />
              {reviewStats.total > 0 ? (
                <>
                  <span className="text-sm font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({reviewStats.total} đánh giá)</span>
                </>
              ) : (
                <span className="text-sm text-gray-400">Chưa có đánh giá</span>
              )}
              {product.sold_count > 0 && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">{product.sold_count} đã bán</span>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <span className="text-3xl font-bold text-brand-600">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.original_price)}</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-50 text-red-600 rounded">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Size */}
            {sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Kích cỡ: <span className="font-normal text-gray-500">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] px-3.5 py-2 text-sm font-medium border rounded-lg transition-colors ${selectedSize === size
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-brand-300'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Màu sắc: <span className="font-normal text-gray-500">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2 text-sm font-medium border rounded-lg transition-colors ${selectedColor === color
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-brand-300'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            {selectedVariant && (
              <p className={`text-sm mb-4 ${selectedVariant.stock > 10 ? 'text-green-600' : selectedVariant.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                {selectedVariant.stock > 10 ? '● Còn hàng' : selectedVariant.stock > 0 ? `● Còn ${selectedVariant.stock} sản phẩm` : '● Hết hàng'}
              </p>
            )}

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  <Minus size={15} />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(selectedVariant?.stock || 99, quantity + 1))} className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  <Plus size={15} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant || selectedVariant?.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
              >
                <ShoppingBag size={17} />
                {adding ? 'Đang thêm...' : selectedVariant?.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`w-11 h-11 flex items-center justify-center border rounded-lg transition-all duration-200 ${wishlist
                    ? 'border-brand-400 bg-brand-50 text-brand-500'
                    : 'border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-400'
                  }`}
              >
                <Heart size={18} className={wishlist ? 'fill-brand-500' : ''} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { icon: Truck, text: 'Miễn phí giao hàng từ 500K' },
                { icon: RefreshCw, text: 'Đổi trả trong 30 ngày' },
                { icon: Shield, text: 'Hàng chính hãng 100%' },
                { icon: Package, text: 'Đóng gói cẩn thận' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5">
                  <Icon size={13} className="text-gray-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === TABS === */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden mb-12">
          <div className="flex border-b border-gray-100 bg-gray-50">
            {[
              { key: 'info', label: 'Thông tin sản phẩm' },
              { key: 'reviews', label: `Đánh giá (${reviewStats.total})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${activeTab === tab.key
                    ? 'text-brand-600 border-b-2 border-brand-500 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 lg:p-8 bg-white">
            {/* Tab: Info */}
            {activeTab === 'info' && (
              <div className="max-w-2xl">
                {product.description ? (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="text-gray-400 text-sm">Chưa có thông tin chi tiết</p>
                )}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {product.brand && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-400 mb-1">Thương hiệu</p>
                      <p className="text-sm font-semibold text-gray-900">{product.brand}</p>
                    </div>
                  )}
                  {product.category && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-400 mb-1">Danh mục</p>
                      <p className="text-sm font-semibold text-gray-900">{product.category.name}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">Đã bán</p>
                    <p className="text-sm font-semibold text-gray-900">{product.sold_count || 0}</p>
                  </div>
                  {sizes.length > 0 && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-400 mb-1">Kích cỡ</p>
                      <p className="text-sm font-semibold text-gray-900">{sizes.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div>
                {/* Write review form */}
                {user && (
                  <div className="mb-8 p-5 border border-gray-100 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Viết đánh giá của bạn</h4>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setReviewHover(s)}
                          onMouseLeave={() => setReviewHover(0)}
                          onClick={() => setReviewRating(s)}
                          className="p-0.5"
                        >
                          <Star
                            size={24}
                            className={`transition-colors ${s <= (reviewHover || reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                          />
                        </button>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        {reviewRating === 1 ? 'Rất tệ' : reviewRating === 2 ? 'Tệ' : reviewRating === 3 ? 'Bình thường' : reviewRating === 4 ? 'Tốt' : 'Rất tốt'}
                      </span>
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none resize-none transition-colors"
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="mt-3 px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </div>
                )}
                {!user && (
                  <div className="mb-8 p-5 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-500">Vui lòng <Link to="/login" className="text-brand-600 font-medium hover:underline">đăng nhập</Link> để viết đánh giá</p>
                  </div>
                )}

                {reviews.length > 0 ? (
                  <>
                    {/* Rating Overview */}
                    <div className="flex items-center gap-8 mb-8 p-6 bg-gray-50 rounded-xl">
                      <div className="text-center shrink-0">
                        <div className="text-4xl font-bold text-gray-900 mb-1">{avgRating.toFixed(1)}</div>
                        <StarRating rating={avgRating} size={15} />
                        <p className="text-xs text-gray-400 mt-1">{reviewStats.total} đánh giá</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = reviews.filter(r => r.rating === star).length;
                          const pct = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-3">{star}</span>
                              <Star size={10} className="fill-yellow-400 text-yellow-400 shrink-0" />
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 w-4">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0 text-sm font-bold text-brand-600">
                            {review.user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-gray-900">{review.user?.name}</span>
                              <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                            </div>
                            <StarRating rating={review.rating} size={12} />
                            {review.comment && <p className="text-sm text-gray-600 mt-2">{review.comment}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Star size={36} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">Chưa có đánh giá nào cho sản phẩm này</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* === RELATED PRODUCTS === */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Sản phẩm liên quan</h2>
              <Link to={`/products?category=${product.category?.slug}`} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map(rp => {
                const img = rp.images?.find(i => i.is_primary) || rp.images?.[0];
                const rpDiscount = rp.original_price && Number(rp.original_price) > Number(rp.price);
                return (
                  <Link key={rp.id} to={`/product/${rp.slug}`} className="group border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      {img && <img src={img.image_url} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      {rpDiscount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          -{Math.round((1 - Number(rp.price) / Number(rp.original_price)) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-sm text-gray-800 line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors">{rp.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-brand-600">{formatPrice(rp.price)}</span>
                        {rpDiscount && <span className="text-xs text-gray-400 line-through">{formatPrice(rp.original_price)}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}