import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { publishJob } from '../../services/businessService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';

interface JobRow {
  id: string;
  title: string;
  location: string;
  status: string;
  approved_by_agency: boolean;
  salary_display: string | null;
  published_at: string | null;
  created_at: string;
  job_type: string | null;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'paused' | 'closed'>('all');

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from('jobs')
      .select('id, title, location, status, approved_by_agency, salary_display, published_at, created_at, job_type')
      .order('created_at', { ascending: false })
      .limit(150);
    if (filter !== 'all') q = q.eq('status', filter);
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

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Jobs</h1>
          <p className="text-sm text-slate-500 mt-0.5">Publish, pause, or close agency-managed roles</p>
        </div>
        <Link to="/admin/businesses">
          <Button size="sm" variant="outline">From hiring requests →</Button>
        </Link>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
        {(['all', 'published', 'draft', 'paused', 'closed'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border capitalize min-h-[36px] ${
              filter === f ? 'bg-[#0066FF] text-white border-[#0066FF]' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {!loading && jobs.length === 0 && (
        <EmptyState
          title="No jobs in this view"
          description="Accept a business hiring request to create a job, then publish it."
          action={
            <Link to="/admin/businesses"><Button size="sm">Hiring requests</Button></Link>
          }
        />
      )}

      <div className="space-y-2">
        {jobs.map((j) => (
          <div key={j.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-slate-900">{j.title}</div>
                <div className="text-sm text-slate-600">
                  {j.location}
                  {j.salary_display ? ` · ${j.salary_display}` : ''}
                  {j.job_type ? ` · ${j.job_type.replace('-', ' ')}` : ''}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-2 items-center">
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
                {j.status === 'paused' && (
                  <Button size="sm" variant="danger" disabled={busy === j.id} onClick={() => setStatus(j.id, 'closed')}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
