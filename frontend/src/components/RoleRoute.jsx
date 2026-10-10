import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * RoleRoute restricts access to routes based on user roles.
 * `allowedRoles` should be an array of role strings, e.g. ['seller', 'admin'].
 */
const RoleRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // could render a spinner if desired

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role not permitted
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Authorized
  return children;
};

export default RoleRoute;
