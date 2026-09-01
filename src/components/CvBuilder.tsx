import { useState } from 'react';
import { Button } from './ui/Button';
import { AiAssistPanel } from './AiAssistPanel';
import { cn } from '../lib/cn';

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

type CvTemplate = 'classic' | 'modern' | 'hospitality' | 'graduate';

interface CvBuilderProps {
  initial: CvData;
  onSave: (data: CvData) => Promise<void>;
  title?: string;
  showAi?: boolean;
  /** Optional job context for match guidance (skills/experience text from a job). */
  matchAgainst?: { title?: string; skills?: string[]; requirements?: string | null };
}

const TEMPLATES: { id: CvTemplate; label: string; hint: string }[] = [
  { id: 'classic', label: 'Classic', hint: 'Clean ATS-friendly' },
  { id: 'modern', label: 'Modern', hint: 'Clear hierarchy' },
  { id: 'hospitality', label: 'Hospitality', hint: 'Hotels & service' },
  { id: 'graduate', label: 'Fresh graduate', hint: 'Limited experience' },
];

function skillList(s?: string) {
  return (s || '')
    .split(/[,;|]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function computeCvJobMatch(
  form: CvData,
  job?: { title?: string; skills?: string[]; requirements?: string | null },
): { score: number; reasons: { ok: boolean; text: string }[] } | null {
  if (!job) return null;
  const reasons: { ok: boolean; text: string }[] = [];
  let score = 40;
  const mySkills = skillList(form.skills).map((s) => s.toLowerCase());
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
  const req = (job.requirements || '').toLowerCase();
  const exp = (form.experience_notes || '').toLowerCase();
  const title = (job.title || '').toLowerCase();
  const desired = (form.desired_position || form.headline || '').toLowerCase();

  if (desired && title && (title.includes(desired) || desired.includes(title.split(' ')[0] || ''))) {
    score += 20;
    reasons.push({ ok: true, text: 'Desired role aligns with job title' });
  } else if (desired) {
    reasons.push({ ok: false, text: 'Consider aligning desired position with this job' });
  }

  let skillHits = 0;
  for (const js of jobSkills) {
    if (mySkills.some((ms) => ms.includes(js) || js.includes(ms))) skillHits++;
  }
  if (jobSkills.length) {
    const ratio = skillHits / jobSkills.length;
    score += Math.round(ratio * 25);
    reasons.push({
      ok: skillHits > 0,
      text: skillHits > 0 ? `Matched ${skillHits}/${jobSkills.length} listed skills` : 'Add skills from the job description',
    });
  }

  if (form.experience_notes && form.experience_notes.trim().length > 40) {
    score += 10;
    reasons.push({ ok: true, text: 'Experience section has detail' });
  } else {
    reasons.push({ ok: false, text: 'Add concrete work experience' });
  }

  if (form.education?.trim()) {
    score += 5;
    reasons.push({ ok: true, text: 'Education included' });
  }

  // Keyword overlap with requirements (honest, not fabricated)
  const keywords = req.split(/[^a-z0-9]+/).filter((w) => w.length > 4).slice(0, 12);
  const hits = keywords.filter((k) => exp.includes(k) || mySkills.some((s) => s.includes(k))).length;
  if (keywords.length && hits > 0) {
    score += Math.min(10, hits * 2);
    reasons.push({ ok: true, text: `Experience mentions ${hits} requirement keyword(s)` });
  }

  return { score: Math.min(98, Math.max(15, score)), reasons };
}

/** Structured CV form + live preview + templates + print/PDF */
export function CvBuilder({
  initial,
  onSave,
  title = 'Create CV',
  showAi = true,
  matchAgainst,
}: CvBuilderProps) {
  const [form, setForm] = useState<CvData>({ ...initial });
  const [template, setTemplate] = useState<CvTemplate>('classic');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof CvData, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const match = computeCvJobMatch(form, matchAgainst);

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
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not save CV.');
    } finally {
      setSaving(false);
    }
  };

  const previewClass = cn(
    'bg-white border rounded-2xl p-6 sm:p-8 shadow-sm min-h-[320px]',
    template === 'classic' && 'border-slate-200',
    template === 'modern' && 'border-slate-200 border-l-4 border-l-[#0066FF]',
    template === 'hospitality' && 'border-amber-200/80',
    template === 'graduate' && 'border-emerald-200/80',
  );

  const headingClass = cn(
    'font-bold text-slate-900',
    template === 'classic' && 'text-xl',
    template === 'modern' && 'text-2xl tracking-tight',
    template === 'hospitality' && 'text-xl text-amber-950',
    template === 'graduate' && 'text-xl',
  );

  const sectionTitle = cn(
    'text-xs font-bold uppercase tracking-wider mb-1.5',
    template === 'modern' ? 'text-[#0066FF]' : 'text-slate-500',
    template === 'hospitality' && 'text-amber-800',
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Templates */}
      <div className="print:hidden">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Template</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={cn(
                'px-3 py-2 rounded-xl text-left text-sm border transition-colors min-h-[44px]',
                template === t.id
                  ? 'border-[#0066FF] bg-[#EEF4FF] text-[#0066FF]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
              )}
            >
              <span className="font-semibold block">{t.label}</span>
              <span className="text-[11px] opacity-80">{t.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {match && (
        <div className="print:hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            CV match for this job: <span className="text-[#0066FF] tabular-nums">{match.score}%</span>
          </p>
          <ul className="mt-2 space-y-1">
            {match.reasons.slice(0, 5).map((r) => (
              <li key={r.text} className={cn('text-xs', r.ok ? 'text-emerald-700' : 'text-amber-700')}>
                {r.ok ? '✓' : '·'} {r.text}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-400 mt-2">Guidance only — based on fields you entered. AI never invents experience.</p>
        </div>
      )}

      {/* Mobile tabs */}
      <div className="flex lg:hidden gap-1 p-1 bg-slate-100 rounded-xl print:hidden">
        {(['edit', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium min-h-[44px]',
              mobileTab === tab ? 'bg-white shadow text-[#0066FF]' : 'text-slate-600',
            )}
          >
            {tab === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSave}
          className={cn(
            'bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm print:hidden',
            mobileTab === 'preview' && 'hidden lg:block',
          )}
        >
          <p className="text-sm text-slate-500">
            Fill sections below. Preview updates live. Use Print to export PDF (A4).
          </p>

          <div>
            <label className="cj-label">Full name *</label>
            <input className="cj-input" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="cj-label">Phone *</label>
              <input className="cj-input" required value={form.phone} onChange={(e) => set('phone', e.target.value)} inputMode="tel" />
            </div>
            <div>
              <label className="cj-label">Email</label>
              <input className="cj-input" type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="cj-label">Location</label>
            <input className="cj-input" value={form.location || ''} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Lakeside, Pokhara" />
          </div>
          <div>
            <label className="cj-label">Professional title / headline</label>
            <input className="cj-input" value={form.headline || ''} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. Front Office Supervisor" />
          </div>
          <div>
            <label className="cj-label">Desired position</label>
            <input className="cj-input" value={form.desired_position || ''} onChange={(e) => set('desired_position', e.target.value)} />
          </div>
          <div>
            <label className="cj-label">Professional summary</label>
            <textarea className="cj-input min-h-[80px]" value={form.bio || ''} onChange={(e) => set('bio', e.target.value)} placeholder="Short summary based on your real experience only" />
          </div>
          <div>
            <label className="cj-label">Work experience</label>
            <textarea
              className="cj-input min-h-[120px]"
              value={form.experience_notes || ''}
              onChange={(e) => set('experience_notes', e.target.value)}
              placeholder="Employer, role, dates, duties (one block per job)"
            />
          </div>
          <div>
            <label className="cj-label">Education</label>
            <textarea className="cj-input min-h-[72px]" value={form.education || ''} onChange={(e) => set('education', e.target.value)} />
          </div>
          <div>
            <label className="cj-label">Skills</label>
            <input className="cj-input" value={form.skills || ''} onChange={(e) => set('skills', e.target.value)} placeholder="Comma-separated" />
          </div>
          <div>
            <label className="cj-label">Languages</label>
            <input className="cj-input" value={form.languages || ''} onChange={(e) => set('languages', e.target.value)} placeholder="e.g. Nepali, English, Hindi" />
          </div>

          {showAi && (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI assist (review before saving)</p>
              <div className="flex flex-wrap gap-2">
                <AiAssistPanel
                  task="cv_summary"
                  label="Draft summary"
                  buildInput={() =>
                    [form.full_name, form.headline, form.desired_position, form.experience_notes, form.education, form.skills]
                      .filter(Boolean)
                      .join('\n')
                  }
                  onAccept={(text) => set('bio', text)}
                />
                <AiAssistPanel
                  task="improve_experience"
                  label="Polish experience"
                  buildInput={() => form.experience_notes || ''}
                  onAccept={(text) => set('experience_notes', text)}
                  disabled={!form.experience_notes?.trim()}
                />
              </div>
            </div>
          )}

          {err && (
            <p className="text-sm text-red-600" role="alert">
              {err}
            </p>
          )}
          {msg && (
            <p className="text-sm text-emerald-700" role="status">
              {msg}
            </p>
          )}

          <Button type="submit" loading={saving} fullWidth>
            Save CV
          </Button>
        </form>

        {/* Preview */}
        <div
          id="cv-print-area"
          className={cn(previewClass, mobileTab === 'edit' && 'hidden lg:block')}
        >
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h2 className={headingClass}>{form.full_name || 'Your Name'}</h2>
            {form.headline && <p className="text-sm font-medium text-slate-600 mt-0.5">{form.headline}</p>}
            <p className="text-sm text-slate-500 mt-1">
              {[form.phone, form.email, form.location].filter(Boolean).join(' · ')}
            </p>
            {form.desired_position && (
              <p className="text-sm text-slate-500 mt-1">Seeking: {form.desired_position}</p>
            )}
          </div>
          {form.bio && (
            <section className="mb-4">
              <h3 className={sectionTitle}>Summary</h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{form.bio}</p>
            </section>
          )}
          {form.experience_notes && (
            <section className="mb-4">
              <h3 className={sectionTitle}>Experience</h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{form.experience_notes}</p>
            </section>
          )}
          {form.education && (
            <section className="mb-4">
              <h3 className={sectionTitle}>Education</h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{form.education}</p>
            </section>
          )}
          {form.skills && (
            <section className="mb-4">
              <h3 className={sectionTitle}>Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {skillList(form.skills).map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
          {form.languages && (
            <section>
              <h3 className={sectionTitle}>Languages</h3>
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
            width: 210mm;
            max-width: 100%;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
