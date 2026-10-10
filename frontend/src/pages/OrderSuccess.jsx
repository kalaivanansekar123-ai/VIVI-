// src/pages/OrderSuccess.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="max-w-2xl mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
      {orderId ? (
        <p className="mb-4">Your order number is <strong>{orderId}</strong>.</p>
      ) : (
        <p className="mb-4">Your order has been placed.</p>
      )}
      <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderSuccess;
