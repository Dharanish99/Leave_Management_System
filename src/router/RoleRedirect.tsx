import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Redirects authenticated users to their role-specific dashboard.
 */
export function RoleRedirect() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/dashboard/${user.role}`} replace />;
}
