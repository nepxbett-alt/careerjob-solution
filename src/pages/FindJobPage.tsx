import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitPublicJobSeekerRequest } from '../services/opsService';
import { Button } from '../components/ui/Button';
import { Seo } from '../components/Seo';
import { POKHARA_AREAS } from '../lib/config';

export default function FindJobPage() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    area: '',
    desiredPosition: '',
    experienceYears: '',
    skills: '',
    expectedSalary: '',
    availability: 'Immediate',
    notes: '',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.fullName.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setBusy(true);
    try {
      await submitPublicJobSeekerRequest({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        location: form.area ? `${form.area}, Pokhara` : 'Pokhara',
        desiredPosition: form.desiredPosition || undefined,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears, 10) : undefined,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        expectedSalary: form.expectedSalary ? parseInt(form.expectedSalary, 10) : undefined,
        availability: form.availability,
        notes: form.notes || undefined,
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Could not submit. Please try again or WhatsApp us.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="cj-container max-w-md py-16 text-center">
        <Seo title="Request received | CareerJob" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">Thank you</h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Our recruitment team will contact you shortly about suitable jobs in Pokhara.
        </p>
        <Link to="/"><Button variant="outline">Back to home</Button></Link>
      </div>
    );
  }

  return (
    <div className="cj-container max-w-lg py-10">
      <Seo title="Find a Job | Career Job Solution" description="Submit your details. CareerJob Pokhara will contact you." />
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Find a job</h1>
      <p className="text-sm text-slate-500 mb-6">
        Submit your details. Our team contacts you and matches you with suitable workplaces in Pokhara.
      </p>
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
        <div>
          <label className="cj-label">Full name *</label>
          <input className="cj-input" required value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="cj-label">Phone *</label>
            <input className="cj-input" required inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="98XXXXXXXX" />
          </div>
          <div>
            <label className="cj-label">Email</label>
            <input className="cj-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="cj-label">Pokhara area</label>
          <select className="cj-input" value={form.area} onChange={(e) => set('area', e.target.value)}>
            <option value="">All Pokhara</option>
            {POKHARA_AREAS.filter((a) => a !== 'All Pokhara').map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="cj-label">Desired position</label>
          <input className="cj-input" value={form.desiredPosition} onChange={(e) => set('desiredPosition', e.target.value)} placeholder="e.g. Waiter, Sales" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="cj-label">Experience (years)</label>
            <input className="cj-input" type="number" min={0} value={form.experienceYears} onChange={(e) => set('experienceYears', e.target.value)} />
          </div>
          <div>
            <label className="cj-label">Expected salary (NPR)</label>
            <input className="cj-input" type="number" min={0} value={form.expectedSalary} onChange={(e) => set('expectedSalary', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="cj-label">Skills (comma-separated)</label>
          <input className="cj-input" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
        </div>
        <div>
          <label className="cj-label">Availability</label>
          <select className="cj-input" value={form.availability} onChange={(e) => set('availability', e.target.value)}>
            <option>Immediate</option>
            <option>1 week</option>
            <option>2 weeks</option>
            <option>1 month</option>
          </select>
        </div>
        <div>
          <label className="cj-label">Notes</label>
          <textarea className="cj-input min-h-[72px] py-2" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <Button type="submit" fullWidth loading={busy} size="lg">Submit — we will contact you</Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Prefer to browse? <Link to="/jobs" className="text-[#0066FF] font-medium">See open jobs</Link>
      </p>
    </div>
  );
}
