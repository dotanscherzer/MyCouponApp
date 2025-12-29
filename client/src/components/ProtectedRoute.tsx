import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.appRole !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
