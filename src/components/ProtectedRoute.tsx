import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) {
    if (allowedRoles && allowedRoles.includes('ADMIN') && !allowedRoles.includes('USER')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (allowedRoles && allowedRoles.includes('OPERATOR') && !allowedRoles.includes('USER')) {
      return <Navigate to="/operator/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Single Admin Enforcement: Only admin@busticket.com or admin@example.com can access ADMIN-only routes
  if (allowedRoles && allowedRoles.includes('ADMIN') && !allowedRoles.includes('USER') && !allowedRoles.includes('OPERATOR')) {
    const email = user?.email?.toLowerCase();
    if (user?.role !== 'ADMIN' || (email !== 'admin@busticket.com' && email !== 'admin@example.com')) {
      return <Navigate to="/admin/login" replace />;
    }
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (allowedRoles.includes('ADMIN')) {
      return <Navigate to="/admin/login" replace />;
    }
    if (allowedRoles.includes('OPERATOR')) {
      return <Navigate to="/operator/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
