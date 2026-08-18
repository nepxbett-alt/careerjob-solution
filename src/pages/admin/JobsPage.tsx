import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { publishJob } from '../../services/businessService';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

interface JobRow {
  id: string;
  title: string;
  location: string;
  status: string;
  approved_by_agency: boolean;
  salary_display: string | null;
  published_at: string | null;
  created_at: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('jobs')
      .select('id, title, location, status, approved_by_agency, salary_display, published_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    setJobs((data || []) as JobRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const publish = async (id: string) => {
    if (!confirm('Publish this job so candidates can see it?')) return;
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

  const pauseOrClose = async (id: string, status: 'paused' | 'closed') => {
    if (!confirm(`${status === 'paused' ? 'Pause' : 'Close'} this job?`)) return;
    setBusy(id);
    await supabase.from('jobs').update({ status }).eq('id', id);
    load();
    setBusy(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Jobs</h1>
        <Link to="/admin/businesses">
          <Button size="sm" variant="outline">From hiring requests →</Button>
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && jobs.length === 0 && <p className="text-gray-500">No jobs yet. Accept a business request to create one.</p>}

      <div className="space-y-2">
        {jobs.map((j) => (
          <div key={j.id} className="bg-white border rounded-xl p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <div className="font-semibold">{j.title}</div>
                <div className="text-sm text-gray-600">{j.location} · {j.salary_display || 'Salary not set'}</div>
                <div className="text-xs text-gray-400 mt-1 capitalize">
                  {j.status.replace('_', ' ')}
                  {j.approved_by_agency ? ' · Agency approved' : ''}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 h-fit">
                {(j.status === 'draft' || j.status === 'pending_review' || j.status === 'paused') && (
                  <Button size="sm" disabled={busy === j.id} onClick={() => publish(j.id)}>Publish</Button>
                )}
                {j.status === 'published' && (
                  <>
                    <Button size="sm" variant="outline" disabled={busy === j.id} onClick={() => pauseOrClose(j.id, 'paused')}>Pause</Button>
                    <Button size="sm" variant="danger" disabled={busy === j.id} onClick={() => pauseOrClose(j.id, 'closed')}>Close</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
