import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitPublicHireRequest } from '../services/opsService';
import { Button } from '../components/ui/Button';
import { Seo } from '../components/Seo';
import { POKHARA_AREAS } from '../lib/config';

export default function HireStaffPage() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    area: '',
    positionTitle: '',
    numberRequired: '1',
    salaryMin: '',
    salaryMax: '',
    workingHours: '',
    accommodation: 'no',
    meals: 'no',
    experience: '',
    skills: '',
    urgency: 'Normal',
    additional: '',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.businessName.trim() || !form.contactPerson.trim() || !form.phone.trim() || !form.positionTitle.trim()) {
      setError('Business name, contact person, phone and position are required.');
      return;
    }
    setBusy(true);
    try {
      await submitPublicHireRequest({
        businessName: form.businessName,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email || undefined,
        location: form.area ? `${form.area}, Pokhara` : 'Pokhara',
        positionTitle: form.positionTitle,
        numberRequired: parseInt(form.numberRequired, 10) || 1,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin, 10) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax, 10) : undefined,
        workingHours: form.workingHours || undefined,
        accommodation: form.accommodation === 'yes',
        meals: form.meals === 'yes',
        experience: form.experience || undefined,
        skills: form.skills || undefined,
        urgency: form.urgency,
        additional: form.additional || undefined,
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Could not submit. Please try WhatsApp or call us.');
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
          Our recruitment team will contact you shortly about staffing for your business.
        </p>
        <Link to="/"><Button variant="outline">Back to home</Button></Link>
      </div>
    );
  }

  return (
    <div className="cj-container max-w-lg py-10">
      <Seo title="Hire Staff | Career Job Solution" description="Tell us who you need. CareerJob Pokhara recruits for you." />
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Hire staff</h1>
      <p className="text-sm text-slate-500 mb-6">
        Tell us what employee you need. We screen candidates and coordinate with your workplace.
      </p>
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
        <div>
          <label className="cj-label">Business / company name *</label>
          <input className="cj-input" required value={form.businessName} onChange={(e) => set('businessName', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="cj-label">Contact person *</label>
            <input className="cj-input" required value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
          </div>
          <div>
            <label className="cj-label">Phone *</label>
            <input className="cj-input" required inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="98XXXXXXXX" />
          </div>
        </div>
        <div>
          <label className="cj-label">Email</label>
          <input className="cj-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <label className="cj-label">Location (Pokhara area)</label>
          <select className="cj-input" value={form.area} onChange={(e) => set('area', e.target.value)}>
            <option value="">Pokhara</option>
            {POKHARA_AREAS.filter((a) => a !== 'All Pokhara').map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="cj-label">Position required *</label>
            <input className="cj-input" required value={form.positionTitle} onChange={(e) => set('positionTitle', e.target.value)} placeholder="e.g. Waiter" />
          </div>
          <div>
            <label className="cj-label">Number needed</label>
            <input className="cj-input" type="number" min={1} value={form.numberRequired} onChange={(e) => set('numberRequired', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="cj-label">Salary min (NPR)</label>
            <input className="cj-input" type="number" min={0} value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
          </div>
          <div>
            <label className="cj-label">Salary max (NPR)</label>
            <input className="cj-input" type="number" min={0} value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="cj-label">Working hours</label>
          <input className="cj-input" value={form.workingHours} onChange={(e) => set('workingHours', e.target.value)} placeholder="e.g. 9am–6pm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="cj-label">Accommodation?</label>
            <select className="cj-input" value={form.accommodation} onChange={(e) => set('accommodation', e.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div>
            <label className="cj-label">Meals?</label>
            <select className="cj-input" value={form.meals} onChange={(e) => set('meals', e.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
        <div>
          <label className="cj-label">Experience required</label>
          <input className="cj-input" value={form.experience} onChange={(e) => set('experience', e.target.value)} />
        </div>
        <div>
          <label className="cj-label">Skills required</label>
          <input className="cj-input" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
        </div>
        <div>
          <label className="cj-label">Urgency</label>
          <select className="cj-input" value={form.urgency} onChange={(e) => set('urgency', e.target.value)}>
            <option>Normal</option>
            <option>Urgent</option>
            <option>This week</option>
          </select>
        </div>
        <div>
          <label className="cj-label">Additional notes</label>
          <textarea className="cj-input min-h-[72px] py-2" value={form.additional} onChange={(e) => set('additional', e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <Button type="submit" fullWidth loading={busy} size="lg">Submit recruitment request</Button>
      </form>
    </div>
  );
}
