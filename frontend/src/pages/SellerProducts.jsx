// src/pages/SellerProducts.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await api.get('/seller/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load your products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      showToast('Product deleted', 'info');
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Products</h1>
      <button
        onClick={() => navigate('/seller/add-product')}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Add New Product
      </button>
      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : (
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => (
            <li key={p.id} className="border rounded p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.category}</p>
                <p className="mt-2 font-semibold">${p.price.toFixed(2)}</p>
                {p.stock !== undefined && p.stock < 5 && (
                  <span className="mt-1 text-xs text-red-600 font-medium">Low stock</span>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <Link
                  to={`/seller/edit-product/${p.id}`}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >Edit</Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SellerProducts;
