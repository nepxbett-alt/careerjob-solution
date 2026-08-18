import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { BRAND } from '../lib/config';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const [role, setRole] = useState<'candidate' | 'business'>('candidate');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // store intended role in user metadata via signUp options isn't available on OTP;
      // we pass via redirect and also try to update after first login.
      // For magic link we use signInWithOtp with data.
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            role,
            phone: phone.trim(),
          },
          emailRedirectTo: window.location.origin + (role === 'business' ? '/business' : '/candidate/profile'),
        },
      });
      if (otpError) throw otpError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl border p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">C</div>
          <h1 className="text-xl font-bold">Create account</h1>
          <p className="text-sm text-gray-500">{BRAND.name}</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-gray-700 mb-2">Check your email</p>
            <p className="text-sm text-gray-500 mb-4">
              We sent a link to <strong>{email}</strong>. Click it to finish registration.
            </p>
            <Button variant="outline" onClick={() => setSent(false)}>Use different email</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${role === 'candidate' ? 'bg-white shadow text-[#0066FF]' : 'text-gray-600'}`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole('business')}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${role === 'business' ? 'bg-white shadow text-[#0066FF]' : 'text-gray-600'}`}
              >
                Business
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-11 px-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-11 px-3 border rounded-lg" placeholder="98XXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 px-3 border rounded-lg" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Sending…' : 'Continue with email'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-[#0066FF]">Login</Link>
        </p>
      </div>
    </div>
  );
}
