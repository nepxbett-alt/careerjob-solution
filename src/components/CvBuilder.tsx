import { useState } from 'react';
import { Button } from './ui/Button';
import { AiAssistPanel } from './AiAssistPanel';

export interface CvData {
  full_name: string;
  phone: string;
  email?: string;
  location?: string;
  headline?: string;
  bio?: string;
  education?: string;
  experience_notes?: string;
  skills?: string;
  languages?: string;
  desired_position?: string;
}

interface CvBuilderProps {
  initial: CvData;
  onSave: (data: CvData) => Promise<void>;
  title?: string;
  showAi?: boolean;
}

/** Structured CV form + live preview + print */
export function CvBuilder({ initial, onSave, title = 'Create CV', showAi = true }: CvBuilderProps) {
  const [form, setForm] = useState<CvData>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof CvData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim()) {
      setErr('Name and phone are required.');
      return;
    }
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      await onSave(form);
      setMsg('CV saved.');
    } catch (e: any) {
      setErr(e.message || 'Could not save CV.');
    } finally {
      setSaving(false);
    }
  };

  const printCv = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        <Button type="button" variant="outline" size="sm" onClick={printCv}>
          Print / Save as PDF
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor */}
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm print:hidden">
          <p className="text-sm text-slate-500">Fill the sections below. Preview updates live. Print to save as PDF.</p>

          <div>
            <label className="cj-label">Full name *</label>
            <input className="cj-input" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="cj-label">Phone *</label>
              <input className="cj-input" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="cj-label">Email</label>
              <input className="cj-input" type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="cj-label">Location</label>
            <input className="cj-input" value={form.location || ''} onChange={(e) => set('location', e.target.value)} placeholder="Pokhara" />
          </div>
          <div>
            <label className="cj-label">Desired position</label>
            <input className="cj-input" value={form.desired_position || ''} onChange={(e) => set('desired_position', e.target.value)} />
          </div>
          <div>
            <label className="cj-label">Headline</label>
            <input className="cj-input" value={form.headline || ''} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. Waiter · 2 years hospitality" />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <label className="cj-label mb-0">Professional summary</label>
              {showAi && (
                <AiAssistPanel
                  task="cv_summary"
                  label="Generate"
                  buildInput={() =>
                    [
                      form.full_name && `Name: ${form.full_name}`,
                      form.desired_position && `Position: ${form.desired_position}`,
                      form.education && `Education: ${form.education}`,
                      form.skills && `Skills: ${form.skills}`,
                      form.experience_notes && `Experience: ${form.experience_notes}`,
                    ]
                      .filter(Boolean)
                      .join('\n')
                  }
                  onAccept={(r) => set('bio', r)}
                />
              )}
            </div>
            <textarea className="cj-input min-h-[88px] py-2" value={form.bio || ''} onChange={(e) => set('bio', e.target.value)} rows={3} />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <label className="cj-label mb-0">Work experience</label>
              {showAi && (
                <AiAssistPanel
                  task="improve_experience"
                  label="Improve"
                  buildInput={() => form.experience_notes || ''}
                  onAccept={(r) => set('experience_notes', r)}
                />
              )}
            </div>
            <textarea
              className="cj-input min-h-[100px] py-2"
              value={form.experience_notes || ''}
              onChange={(e) => set('experience_notes', e.target.value)}
              placeholder="Employer, role, years, duties…"
              rows={4}
            />
          </div>
          <div>
            <label className="cj-label">Education</label>
            <textarea className="cj-input min-h-[64px] py-2" value={form.education || ''} onChange={(e) => set('education', e.target.value)} rows={2} />
          </div>
          <div>
            <label className="cj-label">Skills (comma-separated)</label>
            <input className="cj-input" value={form.skills || ''} onChange={(e) => set('skills', e.target.value)} />
          </div>
          <div>
            <label className="cj-label">Languages</label>
            <input className="cj-input" value={form.languages || ''} onChange={(e) => set('languages', e.target.value)} placeholder="Nepali, English" />
          </div>

          {err && <p className="text-sm text-red-600" role="alert">{err}</p>}
          {msg && <p className="text-sm text-emerald-600" role="status">{msg}</p>}

          <Button type="submit" fullWidth loading={saving}>
            Save CV
          </Button>
        </form>

        {/* Preview */}
        <div
          id="cv-print-area"
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm min-h-[420px] print:border-0 print:shadow-none print:rounded-none"
        >
          <div className="border-b border-slate-200 pb-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{form.full_name || 'Your name'}</h2>
            {form.headline && <p className="text-sm text-[#0066FF] mt-1 font-medium">{form.headline}</p>}
            <p className="text-sm text-slate-600 mt-2">
              {[form.phone, form.email, form.location || 'Pokhara'].filter(Boolean).join(' · ')}
            </p>
            {form.desired_position && (
              <p className="text-sm text-slate-500 mt-1">Seeking: {form.desired_position}</p>
            )}
          </div>
          {form.bio && (
            <section className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Summary</h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{form.bio}</p>
            </section>
          )}
          {form.experience_notes && (
            <section className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Experience</h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{form.experience_notes}</p>
            </section>
          )}
          {form.education && (
            <section className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Education</h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{form.education}</p>
            </section>
          )}
          {form.skills && (
            <section className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Skills</h3>
              <p className="text-sm text-slate-800">{form.skills}</p>
            </section>
          )}
          {form.languages && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Languages</h3>
              <p className="text-sm text-slate-800">{form.languages}</p>
            </section>
          )}
          {!form.bio && !form.experience_notes && !form.education && (
            <p className="text-sm text-slate-400">Preview appears as you fill the form.</p>
          )}
          <p className="text-[10px] text-slate-400 mt-8 pt-4 border-t border-slate-100">
            CareerJob Solution · Pokhara
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cv-print-area, #cv-print-area * { visibility: visible; }
          #cv-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
