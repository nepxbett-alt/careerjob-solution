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
      setError(error.message || "We couldn't send the link. Please try again.");
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="" className="w-14 h-14 object-contain mx-auto mb-3" width="56" height="56" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Log in</h1>
          <p className="text-sm text-slate-500 mt-1">{BRAND.name} · email magic link</p>
        </div>

        {sent ? (
          <div className="text-center" role="status">
            <p className="font-medium text-slate-900 mb-1">Check your email</p>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We sent a sign-in link to <strong className="text-slate-800">{email}</strong>.
              Open it on this device to continue.
            </p>
            <Button variant="outline" fullWidth onClick={() => setSent(false)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="cj-label">Email address</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="cj-input"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
            {error && (
              <p id="login-error" className="text-sm text-red-600" role="alert">{error}</p>
            )}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? 'Sending link…' : 'Send magic link'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          New here?{' '}
          <Link to="/register" className="text-[#0066FF] font-medium hover:underline">Create account</Link>
        </p>
        <p className="text-center text-sm mt-3">
          <Link to="/" className="text-slate-400 hover:text-slate-600">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
