// src/components/RequireSeller.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * RequireSeller protects routes meant for seller users only.
 * If the user is not authenticated or not a seller, they are redirected to home.
 */
const RequireSeller = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // could render a spinner or placeholder

  if (!user) {
    // Not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'SELLER') {
    // Authenticated but not a seller
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireSeller;
