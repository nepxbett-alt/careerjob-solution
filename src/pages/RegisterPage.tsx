import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BRAND } from '../lib/config';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/cn';

export default function RegisterPage() {
  const [role, setRole] = useState<'candidate' | 'business'>('candidate');
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
            role,
            phone: phone.trim(),
          },
          emailRedirectTo:
            window.location.origin + (role === 'business' ? '/business' : '/candidate/profile'),
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
          <div className="w-12 h-12 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-sm">
            C
          </div>
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
            <div>
              <span className="cj-label" id="role-label">I am a</span>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl" role="group" aria-labelledby="role-label">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                    role === 'candidate' ? 'bg-white shadow text-[#0066FF]' : 'text-slate-600'
                  )}
                >
                  Job seeker
                </button>
                <button
                  type="button"
                  onClick={() => setRole('business')}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                    role === 'business' ? 'bg-white shadow text-[#0066FF]' : 'text-slate-600'
                  )}
                >
                  Business
                </button>
              </div>
            </div>

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
