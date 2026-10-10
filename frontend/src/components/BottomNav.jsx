import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, User, CreditCard } from 'lucide-react';

const BottomNav = () => {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center text-xs transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-90 backdrop-filter backdrop-blur-md border-t border-gray-200 shadow-md md:hidden z-10">
      <div className="flex justify-around py-2">
        <NavLink to="/" className={linkClass}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/products" className={linkClass}>
          <ShoppingBag size={20} />
          <span>Shop</span>
        </NavLink>
        <NavLink to="/cart" className={linkClass}>
          <ShoppingBag size={20} />
          <span>Cart</span>
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <User size={20} />
          <span>Me</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
