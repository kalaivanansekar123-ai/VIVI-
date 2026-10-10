// src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error(err);
        showToast('Failed to load orders.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [showToast]);

  if (loading) return <div className="flex justify-center items-center py-12"><span className="text-gray-500">Loading orders...</span></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Your Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">You have no orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map(order => (
            <li key={order.id} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order #{order.id}</span>
                <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-2">Total: ${order.total.toFixed(2)}</p>
              <Link to={`/order/${order.id}`} className="text-indigo-600 hover:underline mt-2 inline-block">View Details</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders;
