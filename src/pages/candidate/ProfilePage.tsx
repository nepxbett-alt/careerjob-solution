import { useAuth } from '../../contexts/AuthContext';
export default function ProfilePage() {
  const { profile, user } = useAuth();
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
        <p><span className="text-gray-500">Name:</span> {profile?.full_name || '—'}</p>
        <p><span className="text-gray-500">Email:</span> {profile?.email || user?.email}</p>
        <p><span className="text-gray-500">Phone:</span> {profile?.phone || '—'}</p>
        <p><span className="text-gray-500">Role:</span> {profile?.role}</p>
      </div>
      <p className="text-xs text-gray-400 mt-4">Full profile editor coming next.</p>
    </div>
  );
}
