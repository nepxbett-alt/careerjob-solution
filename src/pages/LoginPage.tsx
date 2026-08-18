import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { BRAND } from '../lib/config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithMagicLink, user, profile } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  if (user && profile) {
    const dest =
      profile.role === 'candidate' ? '/candidate' :
      profile.role === 'business' ? '/business' :
      '/admin';
    navigate(redirect.startsWith('/') ? redirect : dest, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signInWithMagicLink(email.trim());
    setLoading(false);
    if (error) {
      setError(error.message || 'Unable to send magic link. Please try again.');
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">C</div>
          <h1 className="text-xl font-bold">{BRAND.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with email magic link</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-gray-700 mb-2">Check your email</p>
            <p className="text-sm text-gray-500 mb-6">
              We sent a sign-in link to <strong>{email}</strong>. Click the link to continue.
            </p>
            <Button variant="outline" onClick={() => setSent(false)}>Use a different email</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:border-[#0066FF] outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Sending…' : 'Send magic link'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          New here? <Link to="/register" className="text-[#0066FF] hover:underline">Create account</Link>
        </p>
        <p className="text-center text-sm mt-2">
          <Link to="/" className="text-gray-400 hover:text-gray-600">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
