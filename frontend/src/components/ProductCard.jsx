import React from 'react';
import { Link } from 'react-router-dom';
import { formatRupee } from '../utils/format';
import { productImageUrl } from '../utils/productImages';
import ProductImage from './ProductImage';

const ProductCard = ({ product, onAddToCart }) => {
  if (!product) return null;
  const id = product.id;
  return (
    <div className="bg-white rounded-lg shadow transition transform hover:scale-[1.02] overflow-hidden flex flex-col">
      <Link to={`/products/${id}`} className="block">
        <ProductImage
          src={productImageUrl(product)}
          alt={product.name}
          className="h-48 w-full"
        />
      </Link>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <Link to={`/products/${id}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2" title={product.name}>
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500">{product.category}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-indigo-600 font-semibold">{formatRupee(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatRupee(product.original_price)}</span>
          )}
        </div>
        {onAddToCart && (
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(); }}
            className="mt-auto w-full bg-indigo-600 text-white py-1.5 rounded-md text-sm hover:bg-indigo-700 transition disabled:opacity-50"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
