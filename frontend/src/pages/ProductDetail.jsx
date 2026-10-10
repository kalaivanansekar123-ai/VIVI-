// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatRupee } from '../utils/format';
import { productImageUrl } from '../utils/productImages';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data;
        const prod = data.product || data;
        setProduct(prod);
        if (data.similarProducts) setSimilar(data.similarProducts);
      } catch (err) {
        console.error(err);
        showToast('Failed to load product', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate, showToast]);

  const handleAdd = async () => {
    try {
      await addToCart(product.id, 1);
    } catch (e) {
      // toast handled
    }
  };

  if (loading) return <div className="flex justify-center items-center py-12"><span className="text-gray-500">Loading...</span></div>;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Link to="/products" className="text-indigo-600 hover:underline">← Back to products</Link>
      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-xl p-6 shadow">
        <ProductImage
          src={productImageUrl(product)}
          alt={product.name}
          className="w-full aspect-square rounded-lg"
        />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.category}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl text-indigo-600 font-bold">{formatRupee(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-gray-400 line-through">{formatRupee(product.original_price)}</span>
                <span className="text-green-600 text-sm font-medium">{product.discount_percentage}% off</span>
              </>
            )}
          </div>
          <p className="text-sm">Rating: {product.rating} ({product.rating_count} reviews) | Stock: {product.stock}</p>
          <p className="text-gray-600">{product.description}</p>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
      {similar.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Similar Products</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={() => addToCart(p.id, 1)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
