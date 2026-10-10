// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import SortSelect from '../components/SortSelect';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (sort) params.sort = sort;
      const res = await api.get('/products', { params });
      const list = Array.isArray(res.data) ? res.data : (res.data.products || []);
      setProducts(list);
    } catch (err) {
      console.error(err);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1);
    } catch (e) {
      // toast handled in context
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 text-center shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Welcome to ViviMart</h1>
        <p className="text-lg">Your one-stop shop for everything you love.</p>
      </section>

      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <SearchBar onSearch={setSearch} placeholder="Search products..." />
        <CategoryFilter onSelect={setCategory} />
        <SortSelect onChange={setSort} />
      </section>

      <section>
        {loading ? (
          <div className="flex justify-center items-center py-12"><span className="text-gray-500">Loading products...</span></div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No products found.</div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={() => handleAddToCart(p)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
