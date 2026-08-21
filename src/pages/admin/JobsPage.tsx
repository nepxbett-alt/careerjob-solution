import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Star, Eraser } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { publishJob } from '../../services/businessService';
import { setJobFeatured } from '../../services/jobService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatJobTitle, formatSalaryDisplay, formatJobType } from '../../lib/formatText';

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
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'paused' | 'closed' | 'featured'>('all');

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

  const featuredCount = jobs.filter((j) => j.is_featured).length;
  const badCount = jobs.filter(isBadSalary).length;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0B1220]">Jobs</h1>
          <p className="text-sm text-[#6B7789] mt-0.5">
            Publish roles · Mark <strong>Featured</strong> for homepage (aim for 4–6)
          </p>
        </div>
        <Link to="/admin/businesses">
          <Button size="sm" variant="outline">
            From hiring requests →
          </Button>
        </Link>
      </div>

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
        <EmptyState title="No jobs in this filter" description="Try another status or publish a hiring request." />
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
