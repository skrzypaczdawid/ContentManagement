// apps/web/src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const [showLogin, setShowLogin] = React.useState(true);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, show login/register pages
  if (!isAuthenticated) {
    return showLogin ? (
      <Login 
        onLoginSuccess={() => {}} 
        onRegisterClick={() => setShowLogin(false)} 
      />
    ) : (
      <Register 
        onRegisterSuccess={() => {}} 
        onLoginClick={() => setShowLogin(true)}
      />
    );
  }

  // If role is required but user doesn't have it, show access denied
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  // User is authenticated and has the required role (if any)
  return <>{children}</>;
};

export default ProtectedRoute;