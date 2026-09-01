import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitPublicApplication } from '../services/publicApplicationService';
import { Button } from './ui/Button';
import { POKHARA_AREAS } from '../lib/config';
import { CheckCircle2, X, Copy, Check } from 'lucide-react';
import { formatJobTitle } from '../lib/formatText';

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
  const [copied, setCopied] = useState(false);

  const title = formatJobTitle(jobTitle) || jobTitle;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !phone.trim()) {
      setError('Full name and phone number are required.');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
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

  const copyRef = async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (reference) {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 sm:p-8 text-center space-y-4"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" aria-hidden />
        <div>
          <h3 className="text-lg font-bold text-[#0B1220]">Application received</h3>
          <p className="text-sm text-[#3D4A5C] mt-1.5 leading-relaxed">
            {successMsg || `Thank you. CareerJob will review your application for ${title}.`}
          </p>
        </div>
        <div className="rounded-xl bg-white border border-emerald-100 px-4 py-3 inline-flex flex-col items-center gap-1.5 min-w-[200px]">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7789]">
            Your reference
          </span>
          <div className="flex items-center gap-2">
            <code className="text-base font-bold text-[#0B1220] tracking-wide">{reference}</code>
            <button
              type="button"
              onClick={copyRef}
              className="p-1.5 rounded-lg text-[#6B7789] hover:bg-[#F7F9FC] hover:text-[#0066FF]"
              aria-label="Copy reference"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-xs text-[#6B7789] max-w-sm mx-auto leading-relaxed">
          Save this reference. Our team may contact you on the phone number you provided if you are shortlisted.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#0B1220]">Apply for this role</h3>
          <p className="text-sm text-[#6B7789] mt-0.5">
            <span className="font-medium text-[#3D4A5C]">{title}</span>
            <span className="text-[#98A2B3]"> · No account required</span>
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#98A2B3] hover:bg-[#F7F9FC] hover:text-[#0B1220]"
            aria-label="Close application form"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="cj-label" htmlFor="pa-name">
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
          <label className="cj-label" htmlFor="pa-phone">
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
          <label className="cj-label" htmlFor="pa-email">
            Email <span className="font-normal text-[#98A2B3]">(optional)</span>
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
          <label className="cj-label" htmlFor="pa-location">
            Your area
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
          <label className="cj-label" htmlFor="pa-edu">
            Education <span className="font-normal text-[#98A2B3]">(optional)</span>
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
          <label className="cj-label" htmlFor="pa-exp">
            Experience <span className="font-normal text-[#98A2B3]">(optional)</span>
          </label>
          <input
            id="pa-exp"
            className="cj-input"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 2 years hotel / restaurant"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="cj-label" htmlFor="pa-msg">
            Note to CareerJob <span className="font-normal text-[#98A2B3]">(optional)</span>
          </label>
          <textarea
            id="pa-msg"
            className="cj-input min-h-[80px] py-2.5"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Anything we should know?"
          />
        </div>
      </div>

      <Button type="submit" size="lg" fullWidth loading={busy} disabled={busy}>
        {busy ? 'Submitting…' : 'Submit application'}
      </Button>

      <p className="text-xs text-[#98A2B3] text-center leading-relaxed">
        By applying, you agree that CareerJob may contact you about this role and similar opportunities.
      </p>
    </form>
  );
}
