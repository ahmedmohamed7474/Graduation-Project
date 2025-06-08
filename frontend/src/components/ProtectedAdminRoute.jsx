import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin (roleId === 1)
  if (user.roleId !== 1) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
