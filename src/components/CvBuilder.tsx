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

type CvTemplate = 'modern' | 'classic' | 'hospitality' | 'graduate';

interface CvBuilderProps {
  initial: CvData;
  onSave: (data: CvData) => Promise<void>;
  title?: string;
  showAi?: boolean;
  matchAgainst?: { title?: string; skills?: string[]; requirements?: string | null };
}

const TEMPLATES: { id: CvTemplate; label: string; hint: string }[] = [
  { id: 'modern', label: 'Modern', hint: 'Premium · recommended' },
  { id: 'classic', label: 'Classic', hint: 'ATS-friendly' },
  { id: 'hospitality', label: 'Hospitality', hint: 'Hotels & service' },
  { id: 'graduate', label: 'Graduate', hint: 'Limited experience' },
];

function skillList(s?: string) {
  return (s || '')
    .split(/[,;|]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Split experience_notes into blocks by blank lines */
function experienceBlocks(text?: string) {
  if (!text?.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
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

  const keywords = req.split(/[^a-z0-9]+/).filter((w) => w.length > 4).slice(0, 12);
  const hits = keywords.filter((k) => exp.includes(k) || mySkills.some((s) => s.includes(k))).length;
  if (keywords.length && hits > 0) {
    score += Math.min(10, hits * 2);
    reasons.push({ ok: true, text: `Experience mentions ${hits} requirement keyword(s)` });
  }

  return { score: Math.min(98, Math.max(15, score)), reasons };
}

export function CvBuilder({
  initial,
  onSave,
  title = 'Create CV',
  showAi = true,
  matchAgainst,
}: CvBuilderProps) {
  const [form, setForm] = useState<CvData>({ ...initial });
  const [template, setTemplate] = useState<CvTemplate>('modern');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof CvData, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const match = computeCvJobMatch(form, matchAgainst);
  const skills = skillList(form.skills);
  const expBlocks = experienceBlocks(form.experience_notes);
  const contactBits = [form.phone, form.email, form.location].filter(Boolean);

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

  const accent =
    template === 'hospitality' ? '#B45309' : template === 'graduate' ? '#047857' : '#0066FF';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fill details → preview → Print / PDF. AI can polish wording.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
      </div>

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
              <span className="text-[11px] opacity-70">{t.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 md:hidden print:hidden">
        {(['edit', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold border min-h-[44px]',
              mobileTab === tab ? 'bg-[#0066FF] text-white border-[#0066FF]' : 'bg-white border-slate-200 text-slate-700',
            )}
          >
            {tab === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* FORM */}
        <form
          onSubmit={handleSave}
          className={cn(
            'space-y-3 print:hidden bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm',
            mobileTab === 'preview' && 'hidden md:block',
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your details</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="cj-label" htmlFor="cv-name">Full name *</label>
              <input id="cv-name" className="cj-input" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
            </div>
            <div>
              <label className="cj-label" htmlFor="cv-phone">Phone *</label>
              <input id="cv-phone" className="cj-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
            </div>
            <div>
              <label className="cj-label" htmlFor="cv-email">Email</label>
              <input id="cv-email" type="email" className="cj-input" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="cj-label" htmlFor="cv-loc">Location</label>
              <input id="cv-loc" className="cj-input" placeholder="Pokhara, Lakeside…" value={form.location || ''} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div>
              <label className="cj-label" htmlFor="cv-desired">Desired position</label>
              <input id="cv-desired" className="cj-input" placeholder="Waiter, Sales, Reception…" value={form.desired_position || ''} onChange={(e) => set('desired_position', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="cj-label" htmlFor="cv-head">Headline</label>
              <input id="cv-head" className="cj-input" placeholder="e.g. Hospitality professional · 3 years experience" value={form.headline || ''} onChange={(e) => set('headline', e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="cj-label" htmlFor="cv-bio">Professional summary</label>
              {showAi && (
                <AiAssistPanel
                  task="cv_summary"
                  buildInput={() =>
                    [form.full_name, form.desired_position, form.bio, form.experience_notes, form.skills, form.education]
                      .filter(Boolean)
                      .join('\n')
                  }
                  onAccept={(text) => set('bio', text)}
                  label="✨ Improve"
                />
              )}
            </div>
            <textarea id="cv-bio" className="cj-input min-h-[88px]" rows={3} value={form.bio || ''} onChange={(e) => set('bio', e.target.value)} placeholder="2–4 sentences about strengths and what you seek." />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="cj-label" htmlFor="cv-exp">Work experience</label>
              {showAi && (
                <AiAssistPanel
                  task="improve_experience"
                  buildInput={() =>
                    [form.desired_position, form.experience_notes].filter(Boolean).join('\n')
                  }
                  onAccept={(text) => set('experience_notes', text)}
                  label="✨ Improve"
                />
              )}
            </div>
            <textarea
              id="cv-exp"
              className="cj-input min-h-[140px] font-mono text-[13px]"
              rows={6}
              value={form.experience_notes || ''}
              onChange={(e) => set('experience_notes', e.target.value)}
              placeholder={'Separate each job with a blank line:\n\nWaiter — Lakeside Hotel (2022–2024)\n• Served 80+ guests daily\n• Trained 2 junior staff\n\nSales Assistant — New Road (2021–2022)\n• …'}
            />
            <p className="text-[11px] text-slate-400 mt-1">Tip: one blank line between jobs. Use • for bullet points.</p>
          </div>

          <div>
            <label className="cj-label" htmlFor="cv-edu">Education</label>
            <textarea id="cv-edu" className="cj-input min-h-[72px]" rows={2} value={form.education || ''} onChange={(e) => set('education', e.target.value)} placeholder="School / college, year, level" />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="cj-label" htmlFor="cv-skills">Skills</label>
              {showAi && (
                <AiAssistPanel
                  task="improve_cv"
                  buildInput={() =>
                    [form.desired_position, form.skills, form.experience_notes].filter(Boolean).join('\n')
                  }
                  onAccept={(text) => set('skills', text)}
                  label="✨ Suggest"
                />
              )}
            </div>
            <input id="cv-skills" className="cj-input" value={form.skills || ''} onChange={(e) => set('skills', e.target.value)} placeholder="Customer service, Nepali, English, POS…" />
          </div>

          <div>
            <label className="cj-label" htmlFor="cv-lang">Languages</label>
            <input id="cv-lang" className="cj-input" value={form.languages || ''} onChange={(e) => set('languages', e.target.value)} placeholder="Nepali, English, Hindi" />
          </div>

          {match && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-800">Job fit hint · {match.score}%</p>
              <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
                {match.reasons.map((r) => (
                  <li key={r.text}>{r.ok ? '✓' : '·'} {r.text}</li>
                ))}
              </ul>
            </div>
          )}

          {err && <p className="text-sm text-red-600" role="alert">{err}</p>}
          {msg && <p className="text-sm text-emerald-700" role="status">{msg}</p>}

          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            Save CV
          </Button>
        </form>

        {/* PREVIEW — print target */}
        <div className={cn(mobileTab === 'edit' && 'hidden md:block')}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 print:hidden">Live preview</p>
          <div
            id="cv-print-area"
            className={cn(
              'cv-sheet bg-white overflow-hidden shadow-[0_8px_40px_rgba(11,18,32,0.08)]',
              'border border-slate-200/80 rounded-2xl print:rounded-none print:border-0 print:shadow-none',
            )}
            style={{ ['--cv-accent' as string]: accent }}
          >
            {/* Accent bar */}
            <div className="h-1.5 w-full print:h-2" style={{ background: accent }} />

            <div className="p-6 sm:p-8 print:p-[14mm]">
              {/* Header */}
              <header className="mb-6 pb-5 border-b border-slate-100">
                <h2
                  className="text-[1.65rem] sm:text-[1.85rem] font-bold tracking-tight text-slate-900 leading-tight"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {form.full_name || 'Your Name'}
                </h2>
                {(form.headline || form.desired_position) && (
                  <p className="mt-1.5 text-[0.95rem] font-medium" style={{ color: accent }}>
                    {form.headline || form.desired_position}
                  </p>
                )}
                {contactBits.length > 0 && (
                  <p className="mt-2.5 text-[12.5px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                    {contactBits.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        {i > 0 && <span className="text-slate-300 hidden sm:inline print:inline">·</span>}
                        {c}
                      </span>
                    ))}
                  </p>
                )}
              </header>

              {/* Summary */}
              {form.bio?.trim() && (
                <section className="mb-5">
                  <h3 className="cv-section-title" style={{ color: accent }}>
                    Profile
                  </h3>
                  <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">{form.bio}</p>
                </section>
              )}

              {/* Experience */}
              {(expBlocks.length > 0 || form.experience_notes?.trim()) && (
                <section className="mb-5">
                  <h3 className="cv-section-title" style={{ color: accent }}>
                    Experience
                  </h3>
                  <div className="space-y-4">
                    {(expBlocks.length ? expBlocks : [form.experience_notes || '']).map((block, i) => {
                      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
                      const head = lines[0] || '';
                      const rest = lines.slice(1);
                      return (
                        <div key={i} className="relative pl-3 border-l-2" style={{ borderColor: `${accent}33` }}>
                          <p className="text-[13.5px] font-semibold text-slate-900 leading-snug">{head}</p>
                          {rest.length > 0 && (
                            <ul className="mt-1.5 space-y-1">
                              {rest.map((line, j) => (
                                <li key={j} className="text-[13px] text-slate-600 leading-relaxed flex gap-2">
                                  <span className="text-slate-300 shrink-0">•</span>
                                  <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Education */}
              {form.education?.trim() && (
                <section className="mb-5">
                  <h3 className="cv-section-title" style={{ color: accent }}>
                    Education
                  </h3>
                  <p className="text-[13.5px] text-slate-700 whitespace-pre-wrap leading-relaxed">{form.education}</p>
                </section>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <section className="mb-5">
                  <h3 className="cv-section-title" style={{ color: accent }}>
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="text-[11.5px] font-medium px-2.5 py-1 rounded-full text-slate-700"
                        style={{ background: `${accent}12`, color: accent === '#0066FF' ? '#0B3D91' : undefined }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {form.languages?.trim() && (
                <section className="mb-2">
                  <h3 className="cv-section-title" style={{ color: accent }}>
                    Languages
                  </h3>
                  <p className="text-[13.5px] text-slate-700">{form.languages}</p>
                </section>
              )}

              {!form.bio && !form.experience_notes && !form.education && skills.length === 0 && (
                <p className="text-sm text-slate-400 py-8 text-center">Fill the form — your CV preview appears here.</p>
              )}

              <footer className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] text-slate-400 tracking-wide">Career Job Solution · Pokhara</p>
                <p className="text-[10px] text-slate-300">careerjobsolution.com.np</p>
              </footer>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cv-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.45rem;
        }
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden; }
          #cv-print-area, #cv-print-area * { visibility: visible; }
          #cv-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 210mm;
            margin: 0;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
