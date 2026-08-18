import { useAuth } from '../../contexts/AuthContext';
export default function BusinessProfilePage() {
  const { profile } = useAuth();
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Business Profile</h1>
      <p className="text-sm text-gray-600">{profile?.email}</p>
    </div>
  );
}
