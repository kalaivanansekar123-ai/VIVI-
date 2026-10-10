import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleRoute from './components/RoleRoute.jsx';
import RequireSeller from './components/RequireSeller.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import SellerProducts from './pages/SellerProducts.jsx';
import SellerOrders from './pages/SellerOrders.jsx';
import SellerAddProduct from './pages/SellerAddProduct.jsx';
import SellerEditProduct from './pages/SellerEditProduct.jsx';
import Chatbot from './components/Chatbot.jsx';



import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Payment from './pages/Payment.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Orders from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';

const App = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6fb] text-slate-900">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          {/* Seller routes */}
          <Route path="/seller/dashboard" element={<RequireSeller><SellerDashboard /></RequireSeller>} />
          <Route path="/seller/products" element={<RequireSeller><SellerProducts /></RequireSeller>} />
          <Route path="/seller/orders" element={<RequireSeller><SellerOrders /></RequireSeller>} />
          <Route path="/seller/add-product" element={<RequireSeller><SellerAddProduct /></RequireSeller>} />
          <Route path="/seller/edit-product/:id" element={<RequireSeller><SellerEditProduct /></RequireSeller>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
      <Chatbot />
    </div>
  );
};

export default App;
