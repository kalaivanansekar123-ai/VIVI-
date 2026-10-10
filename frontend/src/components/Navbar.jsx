import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white bg-opacity-20 text-white' : 'text-white hover:bg-white hover:bg-opacity-10'}`;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <Link to="/" className="text-2xl font-bold text-white tracking-wider">
          ViviMart
        </Link>
        <div className="flex items-center space-x-4">
          <NavLink to="/products" className={navLinkClass}>Products</NavLink>
          {user ? (
            <>
              <NavLink to="/orders" className={navLinkClass}>Orders</NavLink>
              <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
              <button onClick={() => logout()} className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white hover:bg-opacity-20 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <NavLink to="/register" className={navLinkClass}>Register</NavLink>
            </>
          )}
          <Link to="/cart" className="relative flex items-center text-white hover:text-gray-200 transition-colors">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-rose-600 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
