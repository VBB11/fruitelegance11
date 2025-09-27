import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { token, user } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Redirect admins away from regular user pages
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
