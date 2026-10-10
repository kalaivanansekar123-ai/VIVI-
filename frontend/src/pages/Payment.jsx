// src/pages/Payment.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

const Payment = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    // Simulate mock Net Banking delay
    const timer = setTimeout(async () => {
      try {
        // Create order via backend API (assuming endpoint /orders)
        const orderRes = await api.post('/orders', {
          items: cartItems.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        });
        // Clear cart after successful order
        await clearCart();
        // Navigate to success page with order id
        navigate('/order-success', { state: { orderId: orderRes.data.id } });
        showToast('Order placed successfully!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Payment failed. Please try again.', 'error');
        navigate('/checkout');
      }
    }, 2000); // 2 second mock processing
    return () => clearTimeout(timer);
  }, [cartItems, clearCart, navigate, showToast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Processing Payment...</h2>
      <p className="text-gray-600">Redirecting to mock Net Banking...</p>
    </div>
  );
};

export default Payment;
