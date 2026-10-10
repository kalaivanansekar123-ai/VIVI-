import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);

function mapCartItem(raw) {
  return {
    id: raw.id,
    user_id: raw.user_id,
    product_id: raw.product_id,
    quantity: raw.quantity,
    saved_for_later: raw.saved_for_later,
    created_at: raw.created_at,
    product: {
      id: raw.product_id,
      name: raw.product_name,
      category: raw.category,
      description: raw.description,
      price: raw.price,
      original_price: raw.original_price,
      discount_percentage: raw.discount_percentage,
      stock: raw.stock,
      image: raw.image,
      rating: raw.rating,
    },
  };
}

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartItems([]);
      setSavedItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      const active = (res.data.activeItems || []).map(mapCartItem);
      const saved = (res.data.savedItems || []).map(mapCartItem);
      setCartItems(active);
      setSavedItems(saved.map((i) => i.product));
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to load cart:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      showToast('You must be logged in to add items to the cart.', 'error');
      return;
    }
    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
      showToast('Item added to cart!', 'success');
    } catch (err) {
      console.error('Add to cart error:', err);
      const msg = err.response?.data?.message || 'Failed to add item to cart.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!token) {
      showToast('You must be logged in to modify your cart.', 'error');
      return;
    }
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await fetchCart();
      showToast('Cart updated.', 'success');
    } catch (err) {
      console.error('Update cart error:', err);
      const msg = err.response?.data?.message || 'Failed to update cart.';
      showToast(msg, 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    if (!token) {
      showToast('You must be logged in to modify your cart.', 'error');
      return;
    }
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
      showToast('Item removed from cart.', 'info');
    } catch (err) {
      console.error('Remove from cart error:', err);
      const msg = err.response?.data?.message || 'Failed to remove item.';
      showToast(msg, 'error');
    }
  };

  const clearCart = async () => {
    if (!token) {
      showToast('You must be logged in to clear the cart.', 'error');
      return;
    }
    try {
      const deletes = cartItems.map((item) => api.delete(`/cart/${item.id}`).catch(() => null));
      await Promise.all(deletes);
      await fetchCart();
      showToast('Cart cleared.', 'info');
    } catch (err) {
      console.error('Clear cart error:', err);
      const msg = err.response?.data?.message || 'Failed to clear cart.';
      showToast(msg, 'error');
    }
  };

  const saveItem = async (itemId) => {
    try {
      await api.put(`/cart/${itemId}`, { saved_for_later: 1 });
      await fetchCart();
      showToast('Saved for later', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save item', 'error');
    }
  };

  const moveSavedToCart = async (product, quantity = 1) => {
    if (!token) { showToast('Login required', 'error'); return; }
    await addToCart(product.id, quantity);
    const rawSaved = savedItems.find((p) => p.id === product.id);
    if (rawSaved) {
      setSavedItems((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        saveItem,
        moveSavedToCart,
        refetch: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
