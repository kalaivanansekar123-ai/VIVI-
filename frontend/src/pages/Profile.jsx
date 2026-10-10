// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // if not logged in redirect to login
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    showToast('Logged out', 'info');
    navigate('/');
  };

  if (!user) return null; // or loading spinner

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
