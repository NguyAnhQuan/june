import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function ProductCard({ product }) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price);
  const discountPercent = hasDiscount ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) : 0;

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
        <img
          src={primaryImage?.image_url || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-brand-500 text-white rounded">
            -{discountPercent}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category?.name || product.brand}</p>
        <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-semibold text-brand-600">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}