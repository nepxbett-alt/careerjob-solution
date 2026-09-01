import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Star, Eraser, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { publishJob } from '../../services/businessService';
import { setJobFeatured, createAdminJob } from '../../services/jobService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatJobTitle, formatSalaryDisplay, formatJobType } from '../../lib/formatText';
import { JOB_TYPES, POKHARA_AREAS } from '../../lib/config';
import { useAuth } from '../../contexts/AuthContext';

interface JobRow {
  id: string;
  title: string;
  location: string;
  status: string;
  approved_by_agency: boolean;
  salary_display: string | null;
  salary_min: number | null;
  salary_max: number | null;
  published_at: string | null;
  created_at: string;
  job_type: string | null;
  is_featured: boolean | null;
}

const emptyForm = {
  title: '',
  location_detail: '',
  job_type: 'full-time',
  salary_min: '',
  salary_max: '',
  experience_required: '',
  education_required: '',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  public_employer_label: '',
  application_deadline: '',
  is_featured: false,
  publish: true,
};

function isBadSalary(j: JobRow): boolean {
  const mn = j.salary_min;
  const mx = j.salary_max;
  if (mn != null && mn < 1000) return true;
  if (mx != null && mx < 1000) return true;
  const shown = formatSalaryDisplay(j.salary_display, j.salary_min, j.salary_max);
  if (j.salary_display && !shown) return true;
  return false;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'paused' | 'closed' | 'featured'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from('jobs')
      .select(
        'id, title, location, status, approved_by_agency, salary_display, salary_min, salary_max, published_at, created_at, job_type, is_featured',
      )
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);
    if (filter === 'featured') {
      q = q.eq('is_featured', true);
    } else if (filter !== 'all') {
      q = q.eq('status', filter);
    }
    const { data } = await q;
    setJobs((data || []) as JobRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const publish = async (id: string) => {
    if (!confirm('Publish this job so candidates can see and apply?')) return;
    setBusy(id);
    try {
      await publishJob(id);
      load();
    } catch {
      alert('Failed to publish');
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (id: string, status: 'paused' | 'closed' | 'draft') => {
    const labels = { paused: 'Pause', closed: 'Close', draft: 'Move to draft' };
    if (!confirm(`${labels[status]} this job?`)) return;
    setBusy(id);
    await supabase.from('jobs').update({ status }).eq('id', id);
    load();
    setBusy(null);
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    setBusy(id);
    try {
      await setJobFeatured(id, !current);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Could not update featured flag');
    } finally {
      setBusy(null);
    }
  };

  const clearSalary = async (id: string) => {
    if (!confirm('Clear salary on this job? Public cards will hide salary until you set a real range.')) return;
    setBusy(id);
    await supabase
      .from('jobs')
      .update({ salary_min: null, salary_max: null, salary_display: null })
      .eq('id', id);
    load();
    setBusy(null);
  };

  const bulkClearBadSalaries = async () => {
    const bad = jobs.filter(isBadSalary);
    if (!bad.length) {
      alert('No obvious bad salaries in the current list.');
      return;
    }
    if (!confirm(`Clear salary fields on ${bad.length} job(s) with invalid/placeholder amounts?`)) return;
    setBulkBusy(true);
    try {
      for (const j of bad) {
        await supabase
          .from('jobs')
          .update({ salary_min: null, salary_max: null, salary_display: null })
          .eq('id', j.id);
      }
      await load();
    } finally {
      setBulkBusy(false);
    }
  };

  const keepOnlyFeatured = async (max = 6) => {
    const featured = jobs.filter((j) => j.is_featured);
    if (featured.length <= max) {
      alert(`Already ${featured.length} featured (max ${max}).`);
      return;
    }
    if (!confirm(`Keep the first ${max} featured jobs and remove the rest from homepage?`)) return;
    setBulkBusy(true);
    try {
      for (const j of featured.slice(max)) {
        await setJobFeatured(j.id, false);
      }
      await load();
    } finally {
      setBulkBusy(false);
    }
  };

  const setField = (key: keyof typeof emptyForm, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    const min = form.salary_min ? parseInt(form.salary_min, 10) : null;
    const max = form.salary_max ? parseInt(form.salary_max, 10) : null;
    if ((form.salary_min && (min == null || Number.isNaN(min))) || (form.salary_max && (max == null || Number.isNaN(max)))) {
      setFormError('Salary must be a number (NPR).');
      return;
    }
    if ((min != null && min > 0 && min < 1000) || (max != null && max > 0 && max < 1000)) {
      setFormError('Salary should be at least NPR 1,000, or leave blank.');
      return;
    }

    setCreating(true);
    try {
      await createAdminJob({
        title: form.title.trim(),
        location: 'Pokhara',
        location_detail: form.location_detail || null,
        job_type: form.job_type,
        salary_min: min,
        salary_max: max,
        experience_required: form.experience_required || null,
        education_required: form.education_required || null,
        description: form.description || null,
        responsibilities: form.responsibilities || null,
        requirements: form.requirements || null,
        benefits: form.benefits || null,
        public_employer_label: form.public_employer_label || null,
        application_deadline: form.application_deadline || null,
        is_featured: form.is_featured,
        publish: form.publish,
        created_by: user?.id || null,
      });
      setForm(emptyForm);
      setShowCreate(false);
      if (form.publish) setFilter('published');
      else setFilter('draft');
      await load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Could not create job.');
    } finally {
      setCreating(false);
    }
  };

  const featuredCount = jobs.filter((j) => j.is_featured).length;
  const badCount = jobs.filter(isBadSalary).length;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0B1220]">Jobs</h1>
          <p className="text-sm text-[#6B7789] mt-0.5">
            Create vacancies · Publish · Feature for homepage (aim for 4–6)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              setShowCreate((v) => !v);
              setFormError(null);
            }}
          >
            {showCreate ? (
              <>
                <X className="w-3.5 h-3.5" aria-hidden /> Close form
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" aria-hidden /> Create job
              </>
            )}
          </Button>
          <Link to="/admin/businesses">
            <Button size="sm" variant="outline">
              From hiring requests →
            </Button>
          </Link>
        </div>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-[#0066FF]/25 bg-white p-4 sm:p-5 shadow-sm space-y-4"
        >
          <div>
            <h2 className="font-semibold text-[#0B1220]">New vacancy</h2>
            <p className="text-xs text-[#6B7789] mt-0.5">
              For walk-in employers or roles CareerJob posts directly. No business account required.
            </p>
          </div>

          {form.title.trim() && (
            <div className="rounded-2xl border border-dashed border-[#0066FF]/40 bg-[#F7F9FC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0066FF] mb-2">Public preview</p>
              <p className="font-bold text-[#0B1220] text-lg">{form.title.trim()}</p>
              {form.public_employer_label && (
                <p className="text-sm text-[#6B7789] mt-0.5">{form.public_employer_label}</p>
              )}
              <p className="text-sm text-[#3D4A5C] mt-1">
                {[form.location_detail || 'Pokhara', form.job_type, form.experience_required].filter(Boolean).join(' · ')}
              </p>
              {(form.salary_min || form.salary_max) && (
                <p className="text-sm font-medium text-[#0B1220] mt-1">
                  NPR {[form.salary_min, form.salary_max].filter(Boolean).join('–')}
                </p>
              )}
              {form.description && (
                <p className="text-sm text-[#3D4A5C] mt-2 line-clamp-3 whitespace-pre-wrap">{form.description}</p>
              )}
              {form.application_deadline && (
                <p className="text-xs text-amber-800 mt-2">Deadline: {form.application_deadline}</p>
              )}
              <p className="text-[11px] text-[#98A2B3] mt-2">
                {form.publish ? 'Will appear on public jobs when published.' : 'Saved as draft — not public.'}
              </p>
            </div>
          )}

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {formError}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="cj-label" htmlFor="job-title">
                Job title <span className="text-red-500">*</span>
              </label>
              <input
                id="job-title"
                className="cj-input"
                required
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g. Receptionist, Waiter, Driver"
              />
            </div>

            <div>
              <label className="cj-label" htmlFor="job-area">
                Area in Pokhara
              </label>
              <select
                id="job-area"
                className="cj-input"
                value={form.location_detail}
                onChange={(e) => setField('location_detail', e.target.value)}
              >
                <option value="">Pokhara (general)</option>
                {POKHARA_AREAS.filter((a) => a !== 'All Pokhara').map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="cj-label" htmlFor="job-type">
                Job type
              </label>
              <select
                id="job-type"
                className="cj-input"
                value={form.job_type}
                onChange={(e) => setField('job_type', e.target.value)}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="cj-label" htmlFor="sal-min">
                Salary min (NPR)
              </label>
              <input
                id="sal-min"
                className="cj-input"
                inputMode="numeric"
                value={form.salary_min}
                onChange={(e) => setField('salary_min', e.target.value)}
                placeholder="e.g. 15000"
              />
            </div>

            <div>
              <label className="cj-label" htmlFor="sal-max">
                Salary max (NPR)
              </label>
              <input
                id="sal-max"
                className="cj-input"
                inputMode="numeric"
                value={form.salary_max}
                onChange={(e) => setField('salary_max', e.target.value)}
                placeholder="e.g. 20000"
              />
            </div>

            <div>
              <label className="cj-label" htmlFor="exp">
                Experience
              </label>
              <input
                id="exp"
                className="cj-input"
                value={form.experience_required}
                onChange={(e) => setField('experience_required', e.target.value)}
                placeholder="e.g. 1+ year"
              />
            </div>

            <div>
              <label className="cj-label" htmlFor="edu">
                Education
              </label>
              <input
                id="edu"
                className="cj-input"
                value={form.education_required}
                onChange={(e) => setField('education_required', e.target.value)}
                placeholder="e.g. +2, Bachelor"
              />
            </div>

            <div>
              <label className="cj-label" htmlFor="deadline">
                Application deadline
              </label>
              <input
                id="deadline"
                type="date"
                className="cj-input"
                value={form.application_deadline}
                onChange={(e) => setField('application_deadline', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="cj-label" htmlFor="employer">
                Public employer label <span className="font-normal text-[#98A2B3]">(optional)</span>
              </label>
              <input
                id="employer"
                className="cj-input"
                value={form.public_employer_label}
                onChange={(e) => setField('public_employer_label', e.target.value)}
                placeholder="e.g. Hotel in Lakeside — leave blank to hide"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="cj-label" htmlFor="desc">
                About this role
              </label>
              <textarea
                id="desc"
                className="cj-input min-h-[88px] py-2.5"
                rows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Short description for candidates"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="cj-label" htmlFor="req">
                Requirements
              </label>
              <textarea
                id="req"
                className="cj-input min-h-[72px] py-2.5"
                rows={2}
                value={form.requirements}
                onChange={(e) => setField('requirements', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="cj-label" htmlFor="resp">
                Responsibilities
              </label>
              <textarea
                id="resp"
                className="cj-input min-h-[72px] py-2.5"
                rows={2}
                value={form.responsibilities}
                onChange={(e) => setField('responsibilities', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="cj-label" htmlFor="ben">
                Benefits
              </label>
              <textarea
                id="ben"
                className="cj-input min-h-[64px] py-2.5"
                rows={2}
                value={form.benefits}
                onChange={(e) => setField('benefits', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.publish}
                onChange={(e) => setField('publish', e.target.checked)}
                className="rounded border-[#D0D7E2]"
              />
              <span className="text-[#0B1220] font-medium">Publish immediately</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setField('is_featured', e.target.checked)}
                className="rounded border-[#D0D7E2]"
              />
              <span className="text-[#0B1220] font-medium">Feature on homepage</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" loading={creating} disabled={creating}>
              {form.publish ? 'Create & publish' : 'Save as draft'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setForm(emptyForm);
                setFormError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <Button size="sm" variant="outline" disabled={bulkBusy || badCount === 0} onClick={bulkClearBadSalaries}>
          <Eraser className="w-3.5 h-3.5" aria-hidden />
          Clear bad salaries ({badCount})
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={bulkBusy || featuredCount <= 6}
          onClick={() => keepOnlyFeatured(6)}
        >
          Limit featured to 6 ({featuredCount})
        </Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {(['all', 'published', 'featured', 'draft', 'paused', 'closed'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border min-h-[36px] ${
              filter === f
                ? 'bg-[#0066FF] text-white border-[#0066FF]'
                : 'bg-white text-[#3D4A5C] border-[#E8ECF1] hover:border-[#0066FF]/40'
            }`}
          >
            {f === 'featured' ? 'Featured' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-[#6B7789]">Loading…</p>}
      {!loading && jobs.length === 0 && (
        <EmptyState
          title="No jobs in this filter"
          description="Create a vacancy above, or publish from a hiring request."
          action={
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" aria-hidden /> Create job
            </Button>
          }
        />
      )}

      <div className="space-y-3">
        {jobs.map((j) => {
          const title = formatJobTitle(j.title) || j.title;
          const salary = formatSalaryDisplay(j.salary_display, j.salary_min, j.salary_max);
          const type = formatJobType(j.job_type);
          const bad = isBadSalary(j);
          return (
            <div
              key={j.id}
              className={`rounded-2xl border bg-white p-4 ${
                j.is_featured ? 'border-[#0066FF]/30' : 'border-[#E8ECF1]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[#0B1220]">{title}</h2>
                    {j.is_featured && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#0066FF]">Featured</span>
                    )}
                    {bad && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Bad salary
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#3D4A5C] mt-0.5">
                    {j.location}
                    {salary ? ` · ${salary}` : ''}
                    {type ? ` · ${type}` : ''}
                  </div>
                  <div className="text-xs text-[#98A2B3] mt-1 flex flex-wrap gap-2 items-center">
                    <StatusBadge status={j.status} />
                    {j.approved_by_agency && <span>Agency approved</span>}
                    {j.published_at && <span>Published {new Date(j.published_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 h-fit">
                  {j.status === 'published' && (
                    <a href={`/jobs/${j.id}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden /> View
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant={j.is_featured ? 'primary' : 'outline'}
                    disabled={busy === j.id}
                    onClick={() => toggleFeatured(j.id, !!j.is_featured)}
                    title={j.is_featured ? 'Remove from homepage' : 'Show on homepage'}
                  >
                    <Star className={`w-3.5 h-3.5 ${j.is_featured ? 'fill-current' : ''}`} aria-hidden />
                    {j.is_featured ? 'Featured' : 'Feature'}
                  </Button>
                  {(bad || j.salary_display) && (
                    <Button size="sm" variant="outline" disabled={busy === j.id} onClick={() => clearSalary(j.id)}>
                      Clear salary
                    </Button>
                  )}
                  {(j.status === 'draft' || j.status === 'pending_review' || j.status === 'paused') && (
                    <Button size="sm" disabled={busy === j.id} loading={busy === j.id} onClick={() => publish(j.id)}>
                      Publish
                    </Button>
                  )}
                  {j.status === 'published' && (
                    <>
                      <Button size="sm" variant="outline" disabled={busy === j.id} onClick={() => setStatus(j.id, 'paused')}>
                        Pause
                      </Button>
                      <Button size="sm" variant="danger" disabled={busy === j.id} onClick={() => setStatus(j.id, 'closed')}>
                        Close
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
