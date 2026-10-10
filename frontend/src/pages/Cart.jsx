// src/pages/Cart.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { formatRupee } from '../utils/format';
import { productImageUrl } from '../utils/productImages';
import ProductImage from '../components/ProductImage';

const Cart = () => {
  const { cartItems, savedItems, loading, updateCartItem, removeFromCart, moveSavedToCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, qty) => {
    if (qty < 1) return;
    updateCartItem(itemId, qty);
  };

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId);
  };

  const subtotal = cartItems.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

  if (loading) return <div className="flex justify-center items-center py-12"><span className="text-gray-500">Loading cart...</span></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center border rounded-lg p-4 gap-4 bg-white">
                <ProductImage
                  src={productImageUrl(item.product)}
                  alt={item.product.name}
                  className="w-20 h-20 rounded shrink-0"
                />
                <div className="flex-1">
                  <h2 className="font-medium">{item.product.name}</h2>
                  <p className="text-sm text-gray-500">{formatRupee(item.product.price)}</p>
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                  className="w-16 border rounded px-2 py-1"
                />
                <button onClick={() => handleRemove(item.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-semibold text-lg">Subtotal:</span>
            <span className="font-bold text-xl">{formatRupee(subtotal)}</span>
          </div>
          {savedItems && savedItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Saved for later</h3>
              <ul className="space-y-2">
                {savedItems.map((p) => (
                  <li key={p.id} className="flex items-center justify-between bg-white p-3 rounded border">
                    <span>{p.name}</span>
                    <button onClick={() => moveSavedToCart(p)} className="text-indigo-600 hover:underline">
                      Move to cart
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => navigate('/checkout')}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
