import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BRAND } from '../lib/config';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError('Please enter your name and phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'candidate',
            phone: phone.trim(),
          },
          emailRedirectTo:
            window.location.origin + '/candidate/profile',
        },
      });
      if (otpError) throw otpError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || "We couldn't send the link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="" className="w-14 h-14 object-contain mx-auto mb-3" width="56" height="56" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create account</h1>
          <p className="text-sm text-slate-500 mt-1">{BRAND.name}</p>
        </div>

        {sent ? (
          <div className="text-center" role="status">
            <p className="font-medium text-slate-900 mb-1">Check your email</p>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We sent a link to <strong className="text-slate-800">{email}</strong>.
              Open it to finish registration.
            </p>
            <Button variant="outline" fullWidth onClick={() => setSent(false)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
              Create a free <strong className="text-slate-800">job seeker</strong> account to save jobs, build your CV, and track applications.
            </p>

            <div>
              <label htmlFor="reg-name" className="cj-label">Full name</label>
              <input
                id="reg-name"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="cj-input"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="reg-phone" className="cj-label">Phone</label>
              <input
                id="reg-phone"
                required
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="cj-input"
                placeholder="98XXXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="cj-label">Email</label>
              <input
                id="reg-email"
                required
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cj-input"
                placeholder="you@example.com"
              />
            </div>

            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? 'Sending…' : 'Continue with email'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0066FF] font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
