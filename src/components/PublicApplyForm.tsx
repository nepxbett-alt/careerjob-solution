import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitPublicApplication } from '../services/publicApplicationService';
import { Button } from './ui/Button';
import { POKHARA_AREAS } from '../lib/config';
import { CheckCircle2, X } from 'lucide-react';

interface Props {
  jobId: string;
  jobTitle: string;
  onClose?: () => void;
}

export function PublicApplyForm({ jobId, jobTitle, onClose }: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Pokhara');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !phone.trim()) {
      setError('Full name and phone number are required.');
      return;
    }
    setBusy(true);
    try {
      const res = await submitPublicApplication({
        job_id: jobId,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        location: location || 'Pokhara',
        education: education.trim() || undefined,
        experience: experience.trim() || undefined,
        message: message.trim() || undefined,
      });
      if (!res.success) {
        setError(res.error || 'Submission failed.');
        return;
      }
      setReference(res.application_reference || null);
      setSuccessMsg(res.message || 'Your application has been received.');
    } catch {
      setError('Something went wrong. Please try again or message us on WhatsApp.');
    } finally {
      setBusy(false);
    }
  };

  if (reference) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" aria-hidden />
        <h3 className="text-lg font-semibold text-slate-900">Application received</h3>
        <p className="text-sm text-slate-600">{successMsg}</p>
        <p className="text-sm font-medium text-slate-800">
          Reference:{' '}
          <span className="font-mono text-[#0066FF] tracking-wide">{reference}</span>
        </p>
        <p className="text-xs text-slate-500">
          CareerJob will review your application and contact you if appropriate.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Link to="/jobs">
            <Button variant="outline">Browse more jobs</Button>
          </Link>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Apply for this job</h3>
          <p className="text-sm text-slate-500 mt-0.5">{jobTitle}</p>
          <p className="text-xs text-slate-400 mt-1">No account needed · Takes about one minute</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pa-name">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="pa-name"
            className="cj-input"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pa-phone">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="pa-phone"
            className="cj-input"
            required
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98XXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pa-email">
            Email <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="pa-email"
            type="email"
            className="cj-input"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pa-location">
            Location
          </label>
          <select
            id="pa-location"
            className="cj-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {POKHARA_AREAS.map((a) => (
              <option key={a} value={a === 'All Pokhara' ? 'Pokhara' : a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pa-edu">
            Education <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="pa-edu"
            className="cj-input"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="e.g. +2, Bachelor"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pa-exp">
            Experience <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="pa-exp"
            className="cj-input"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 2 years waiter, hotel"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pa-msg">
            Message to CareerJob <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="pa-msg"
            className="cj-input min-h-[80px]"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Anything we should know?"
          />
        </div>
      </div>

      <Button type="submit" size="lg" fullWidth loading={busy} disabled={busy}>
        Submit application
      </Button>

      <p className="text-xs text-slate-500 text-center">
        By applying you agree that CareerJob may contact you about this role and similar opportunities.
      </p>
    </form>
  );
}
