// src/pages/Checkout.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const { cartItems, loading } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal > 0 ? 5 : 0; // simple flat shipping
  const total = subtotal + shipping;

  const handleProceed = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }
    navigate('/payment');
  };

  if (loading) return <div className="flex justify-center items-center py-12"><span className="text-gray-500">Loading cart...</span></div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="space-y-2">
        <p>Subtotal: <span className="font-medium">${subtotal.toFixed(2)}</span></p>
        <p>Shipping: <span className="font-medium">${shipping.toFixed(2)}</span></p>
        <hr />
        <p>Total: <span className="font-bold text-lg">${total.toFixed(2)}</span></p>
      </div>
      <button
        onClick={handleProceed}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Proceed to Payment (Mock Net Banking)
      </button>
    </div>
  );
};

export default Checkout;
