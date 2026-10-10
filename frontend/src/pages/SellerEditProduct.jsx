// src/pages/SellerEditProduct.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const SellerEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/seller/products/${id}`);
        const p = res.data.product;
        setForm({
          name: p.name || '',
          category: p.category || '',
          price: p.price?.toString() || '',
          stock: p.stock?.toString() || '',
          description: p.description || '',
          imageUrl: p.imageUrl || ''
        });
      } catch (err) {
        console.error(err);
        showToast('Failed to load product details', 'error');
        navigate('/seller/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, showToast, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/seller/products/${id}`, {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10)
      });
      showToast('Product updated successfully', 'success');
      navigate('/seller/products');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to update product';
      showToast(msg, 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12 text-gray-600">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />
        <input
          name="stock"
          type="number"
          placeholder="Stock Quantity"
          value={form.stock}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />
        <input
          name="imageUrl"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default SellerEditProduct;
