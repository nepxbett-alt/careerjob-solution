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
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]" aria-busy="true">
        <p className="text-sm text-[#6B7789]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for profile before role gate (avoids flash redirect)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]" aria-busy="true">
        <p className="text-sm text-[#6B7789]">Loading your account…</p>
      </div>
    );
  }

  if (!allowedRoles.includes(profile.role)) {
    if (profile.role === 'candidate') return <Navigate to="/candidate" replace />;
    if (profile.role === 'business') return <Navigate to="/business" replace />;
    if (['owner', 'admin', 'recruiter', 'staff', 'accountant', 'viewer'].includes(profile.role)) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
