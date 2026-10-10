// src/pages/SellerDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/seller/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error(err);
        showToast('Failed to load seller dashboard.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  if (loading) return <div className="flex justify-center items-center py-12"><span className="text-gray-500">Loading dashboard...</span></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded shadow">
            <h2 className="font-medium">Total Products</h2>
            <p className="text-xl">{stats.totalProducts}</p>
          </div>
          <div className="p-4 border rounded shadow">
            <h2 className="font-medium">Total Orders</h2>
            <p className="text-xl">{stats.totalOrders}</p>
          </div>
          <div className="p-4 border rounded shadow">
            <h2 className="font-medium">Revenue</h2>
            <p className="text-xl">${stats.revenue?.toFixed(2) ?? 0}</p>
          </div>
        </div>
      ) : (
        <p>No statistics available.</p>
      )}
    </div>
  );
};

export default SellerDashboard;
