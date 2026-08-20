import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWalkInCandidate } from '../../services/candidateService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { POKHARA_AREAS } from '../../lib/config';

export default function WalkInPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    location: 'Pokhara',
    area: '',
    education: '',
    experience_years: '',
    skills: '',
    desired_position: '',
    expected_salary: '',
    availability: 'Immediate',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.full_name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setBusy(true);
    try {
      const skills = form.skills
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const created = await createWalkInCandidate({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || undefined,
        location: form.area ? `${form.area}, Pokhara` : form.location || 'Pokhara',
        education: form.education || undefined,
        experience_years: form.experience_years ? parseInt(form.experience_years, 10) : undefined,
        skills,
        desired_position: form.desired_position || undefined,
        expected_salary: form.expected_salary ? parseInt(form.expected_salary, 10) : undefined,
        availability: form.availability || undefined,
        registeredBy: user?.id,
      });
      navigate(`/admin/candidates/${(created as { id: string }).id}`);
    } catch (err: any) {
      setError(err.message || 'Could not register candidate.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Walk-in registration</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Office visitor → Active job seeker. No app login required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div>
          <label className="cj-label" htmlFor="wi-name">Full name *</label>
          <input id="wi-name" className="cj-input" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} autoComplete="name" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="cj-label" htmlFor="wi-phone">Phone *</label>
            <input id="wi-phone" className="cj-input" required value={form.phone} onChange={(e) => set('phone', e.target.value)} inputMode="tel" placeholder="98XXXXXXXX" />
          </div>
          <div>
            <label className="cj-label" htmlFor="wi-email">Email</label>
            <input id="wi-email" type="email" className="cj-input" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="cj-label" htmlFor="wi-area">Pokhara area</label>
          <select id="wi-area" className="cj-input" value={form.area} onChange={(e) => set('area', e.target.value)}>
            <option value="">All Pokhara</option>
            {POKHARA_AREAS.filter((a) => a !== 'All Pokhara').map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="cj-label" htmlFor="wi-desired">Desired position</label>
          <input id="wi-desired" className="cj-input" value={form.desired_position} onChange={(e) => set('desired_position', e.target.value)} placeholder="e.g. Waiter, Sales Executive" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="cj-label" htmlFor="wi-exp">Experience (years)</label>
            <input id="wi-exp" type="number" min={0} className="cj-input" value={form.experience_years} onChange={(e) => set('experience_years', e.target.value)} />
          </div>
          <div>
            <label className="cj-label" htmlFor="wi-sal">Expected salary (NPR)</label>
            <input id="wi-sal" type="number" min={0} className="cj-input" value={form.expected_salary} onChange={(e) => set('expected_salary', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="cj-label" htmlFor="wi-edu">Education</label>
          <input id="wi-edu" className="cj-input" value={form.education} onChange={(e) => set('education', e.target.value)} placeholder="e.g. +2, Bachelor" />
        </div>
        <div>
          <label className="cj-label" htmlFor="wi-skills">Skills (comma-separated)</label>
          <input id="wi-skills" className="cj-input" value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="Sales, English, Computer" />
        </div>
        <div>
          <label className="cj-label" htmlFor="wi-avail">Availability</label>
          <select id="wi-avail" className="cj-input" value={form.availability} onChange={(e) => set('availability', e.target.value)}>
            <option>Immediate</option>
            <option>1 week</option>
            <option>2 weeks</option>
            <option>1 month</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2" role="alert">{error}</p>
        )}

        <Button type="submit" fullWidth loading={busy} size="lg">
          Register as active job seeker
        </Button>
      </form>
    </div>
  );
}
