import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdminRoute({ children }) {
  const { token, user } = useContext(AuthContext);

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;
