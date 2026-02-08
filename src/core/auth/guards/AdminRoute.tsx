import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks';

interface AdminRouteProps {
  children: React.ReactNode;
  fallbackTo?: string;
}

/**
 * Protects admin routes.
 * Requires authentication + admin/owner role or KOSMOS master membership.
 */
export function AdminRoute({ children, fallbackTo = '/app' }: AdminRouteProps) {
  const { isAuthenticated, isLoading, canAccessAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessAdmin()) {
    return <Navigate to={fallbackTo} replace />;
  }

  return <>{children}</>;
}
