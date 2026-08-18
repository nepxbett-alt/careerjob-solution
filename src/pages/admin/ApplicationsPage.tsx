import { useEffect, useState } from 'react';
import { getAllApplications, updateApplicationStatus, type Application } from '../../services/applicationService';
import { Button } from '../../components/ui/Button';

const NEXT: Record<string, string[]> = {
  applied: ['under_review', 'shortlisted', 'rejected'],
  under_review: ['shortlisted', 'rejected'],
  shortlisted: ['interview', 'rejected'],
  interview: ['selected', 'rejected'],
  selected: ['placed', 'rejected'],
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAllApplications(filter ? { status: filter } : undefined)
      .then(setApps)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const changeStatus = async (id: string, status: string) => {
    if (!confirm(`Change status to ${status}?`)) return;
    setBusy(id);
    try {
      await updateApplicationStatus(id, status);
      load();
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">Applications</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 px-3 border rounded-lg text-sm bg-white"
        >
          <option value="">All statuses</option>
          {['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'placed', 'rejected'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}

      {!loading && apps.length === 0 && (
        <p className="text-gray-500">No applications found.</p>
      )}

      <div className="space-y-3">
        {apps.map((app) => (
          <div key={app.id} className="bg-white border rounded-xl p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <div className="font-semibold">{app.candidate_profiles?.full_name || 'Candidate'}</div>
                <div className="text-sm text-gray-600">
                  {app.jobs?.title} · {app.jobs?.location}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {app.candidate_profiles?.phone} · Applied {new Date(app.applied_at).toLocaleDateString()}
                </div>
              </div>
              <span className="text-xs font-medium h-fit px-2 py-1 rounded bg-slate-100 capitalize">
                {app.status.replace('_', ' ')}
              </span>
            </div>
            {(NEXT[app.status] || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {(NEXT[app.status] || []).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={s === 'rejected' ? 'danger' : 'outline'}
                    disabled={busy === app.id}
                    onClick={() => changeStatus(app.id, s)}
                  >
                    {s.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
