import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Phone, Search } from 'lucide-react';
import { getAllApplications, updateApplicationStatus, type Application } from '../../services/applicationService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';

const PIPELINE = [
  { value: '', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'under_review', label: 'Under review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'selected', label: 'Selected' },
  { value: 'placed', label: 'Placed' },
  { value: 'rejected', label: 'Rejected' },
];

const NEXT: Record<string, string[]> = {
  applied: ['under_review', 'shortlisted', 'rejected'],
  under_review: ['shortlisted', 'interview', 'rejected'],
  shortlisted: ['interview', 'selected', 'rejected'],
  interview: ['selected', 'rejected'],
  selected: ['placed', 'rejected'],
};

export default function ApplicationsPage() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('status') || '';
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllApplications(filter ? { status: filter } : undefined);
      setApps(data);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const changeStatus = async (id: string, status: string) => {
    const label = status.replace(/_/g, ' ');
    if (!confirm(`Move this application to “${label}”?`)) return;
    setBusy(id);
    try {
      await updateApplicationStatus(id, status);
      await load();
    } catch {
      alert("Couldn't update status. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const setFilter = (status: string) => {
    const next = new URLSearchParams(params);
    if (status) next.set('status', status);
    else next.delete('status');
    setParams(next);
  };

  const filtered = q.trim()
    ? apps.filter((a) => {
        const hay = `${a.candidate_profiles?.full_name || ''} ${a.candidate_profiles?.phone || ''} ${a.jobs?.title || ''}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      })
    : apps;

  return (
    <div className="max-w-4xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Applications</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pipeline: Applied → Review → Shortlist → Interview → Select → Place
        </p>
      </div>

      {/* Pipeline filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {PIPELINE.map((p) => (
          <button
            key={p.value || 'all'}
            type="button"
            onClick={() => setFilter(p.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors min-h-[36px] ${
              filter === p.value
                ? 'bg-[#0066FF] text-white border-[#0066FF]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
        <label htmlFor="app-search" className="sr-only">Search applications</label>
        <input
          id="app-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, or job title"
          className="cj-input pl-10"
        />
      </div>

      {loading && <p className="text-sm text-slate-500">Loading applications…</p>}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No applications in this view"
          description={filter ? 'Try another status filter or clear search.' : 'When candidates apply, they appear here for review.'}
          action={
            filter ? (
              <Button variant="outline" size="sm" onClick={() => setFilter('')}>Show all</Button>
            ) : undefined
          }
        />
      )}

      <div className="space-y-3">
        {filtered.map((app) => {
          const open = expanded === app.id;
          return (
            <article key={app.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                className="w-full text-left p-4 flex flex-wrap items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                onClick={() => setExpanded(open ? null : app.id)}
                aria-expanded={open}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">
                    {app.candidate_profiles?.full_name || 'Candidate'}
                  </div>
                  <div className="text-sm text-slate-600 mt-0.5">
                    {app.jobs?.title || 'Job'}
                    {app.jobs?.location ? ` · ${app.jobs.location}` : ''}
                  </div>
                  <div className="text-xs text-slate-400 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {app.candidate_profiles?.phone && <span>{app.candidate_profiles.phone}</span>}
                    <span>Applied {new Date(app.applied_at).toLocaleString()}</span>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </button>

              {open && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                  {app.cover_message && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Cover message</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">
                        {app.cover_message}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {app.candidate_profiles?.phone && (
                      <a href={`tel:${app.candidate_profiles.phone}`}>
                        <Button size="sm" variant="outline">
                          <Phone className="w-3.5 h-3.5" aria-hidden /> Call
                        </Button>
                      </a>
                    )}
                    {app.status === 'shortlisted' && (
                      <Link to="/admin/interviews">
                        <Button size="sm" variant="secondary">Schedule interview →</Button>
                      </Link>
                    )}
                    {app.status === 'selected' && (
                      <Link to="/admin/placements">
                        <Button size="sm" variant="secondary">Record placement →</Button>
                      </Link>
                    )}
                  </div>
                  {(NEXT[app.status] || []).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Move to</p>
                      <div className="flex flex-wrap gap-2">
                        {(NEXT[app.status] || []).map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={s === 'rejected' ? 'danger' : s === 'placed' || s === 'selected' ? 'success' : 'outline'}
                            disabled={busy === app.id}
                            loading={busy === app.id}
                            onClick={() => changeStatus(app.id, s)}
                          >
                            {s.replace(/_/g, ' ')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
