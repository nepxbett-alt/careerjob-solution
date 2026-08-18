import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    // redirect to appropriate home
    if (profile.role === 'candidate') return <Navigate to="/candidate" replace />;
    if (profile.role === 'business') return <Navigate to="/business" replace />;
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
