import { useEffect, useState } from 'react';
import {
  getAllPlacements,
  createPlacement,
  markDay30Complete,
  setCommissionStatus,
  placementDayProgress,
  markCandidateAvailable,
  type Placement,
} from '../../services/placementService';
import { getAllApplications, type Application } from '../../services/applicationService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';

export default function PlacementsPage() {
  const { user } = useAuth();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selected, setSelected] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [appId, setAppId] = useState('');
  const [joining, setJoining] = useState('');
  const [salary, setSalary] = useState('');
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending30' | 'commission'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const [p, apps] = await Promise.all([
        getAllPlacements(),
        getAllApplications({ status: 'selected' }),
      ]);
      setPlacements(p);
      setSelected(apps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const app = selected.find((a) => a.id === appId);
    if (!app) return;
    setBusy(true);
    try {
      await createPlacement({
        applicationId: app.id,
        candidateId: app.candidate_id,
        jobId: app.job_id,
        joiningDate: joining || undefined,
        positionTitle: position || app.jobs?.title || undefined,
        salaryAmount: salary ? parseInt(salary, 10) : undefined,
        commissionRate: 30,
        notes: notes || undefined,
        staffId: user?.id,
      });
      setShowForm(false);
      setAppId('');
      setSalary('');
      setPosition('');
      setJoining('');
      setNotes('');
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to record hire');
    } finally {
      setBusy(false);
    }
  };

  const visible = placements.filter((p) => {
    if (filter === 'pending30') return p.day30_status === 'pending' || p.day30_status === 'approaching';
    if (filter === 'commission') return p.commission_status === 'pending' || p.commission_status === 'invoiced';
    return true;
  });

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Hires & placements</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Selected → Hired → 30 days → Commission (30% default)
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Record hire'}
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'pending30', label: '30-day pending' },
            { id: 'commission', label: 'Commission due' },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border min-h-[36px] ${
              filter === f.id
                ? 'bg-[#0066FF] text-white border-[#0066FF]'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 space-y-3 max-w-lg shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Record a hire</p>
          <div>
            <label className="cj-label">Selected candidate</label>
            <select
              required
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="cj-input"
            >
              <option value="">Select…</option>
              {selected.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.candidate_profiles?.full_name} — {a.jobs?.title}
                </option>
              ))}
            </select>
            {selected.length === 0 && (
              <p className="text-xs text-slate-500 mt-1">Mark an application as Selected first.</p>
            )}
          </div>
          <div>
            <label className="cj-label">Position</label>
            <input className="cj-input" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Sales Executive" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="cj-label">Joining date</label>
              <input type="date" className="cj-input" value={joining} onChange={(e) => setJoining(e.target.value)} required />
            </div>
            <div>
              <label className="cj-label">Monthly salary (NPR)</label>
              <input
                type="number"
                min={0}
                className="cj-input"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="30000"
                required
              />
            </div>
          </div>
          {salary && (
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
              Commission (30%): <strong>NPR {Math.round(parseInt(salary, 10) * 0.3).toLocaleString()}</strong> after 30 days
            </p>
          )}
          <div>
            <label className="cj-label">Notes (optional)</label>
            <textarea className="cj-input min-h-[72px] py-2" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="submit" loading={busy} disabled={!appId}>
            Confirm hire
          </Button>
        </form>
      )}

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {!loading && visible.length === 0 && (
        <EmptyState
          title="No hires yet"
          description="When a candidate is Selected, record the hire here with joining date and salary."
        />
      )}

      <div className="space-y-3">
        {visible.map((p) => {
          const prog = placementDayProgress(p.joining_date, p.day30_date);
          return (
            <article key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {p.candidate_profiles?.full_name || 'Candidate'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {p.position_title || p.jobs?.title}
                    {p.organizations?.name ? ` · ${p.organizations.name}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={p.status} />
                  {p.day30_status && <StatusBadge status={p.day30_status === 'completed' ? 'placed' : p.day30_status} />}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
                <div>
                  <p className="text-xs text-slate-400">Joined</p>
                  <p className="font-medium">{p.joining_date || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Salary</p>
                  <p className="font-medium">
                    {p.salary_amount != null ? `NPR ${p.salary_amount.toLocaleString()}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">30-day date</p>
                  <p className="font-medium">{p.day30_date || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Commission</p>
                  <p className="font-medium text-[#0066FF]">
                    {p.commission_amount != null
                      ? `NPR ${p.commission_amount.toLocaleString()}`
                      : '—'}
                  </p>
                </div>
              </div>

              {p.joining_date && p.day30_status !== 'completed' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{prog.daysEmployed} days employed</span>
                    <span>{prog.daysLeft} days left</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0066FF] rounded-full transition-all"
                      style={{ width: `${prog.pct}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {p.day30_status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!confirm('Mark 30-day milestone complete? Commission becomes due.')) return;
                      await markDay30Complete(p.id);
                      load();
                    }}
                  >
                    Complete 30 days
                  </Button>
                )}
                {p.commission_status !== 'paid' && p.commission_status !== 'waived' && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await setCommissionStatus(p.id, 'invoiced');
                        load();
                      }}
                    >
                      Mark invoiced
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={async () => {
                        if (!confirm('Mark commission as paid?')) return;
                        await setCommissionStatus(p.id, 'paid');
                        load();
                      }}
                    >
                      Mark paid
                    </Button>
                  </>
                )}
                <span className="text-xs text-slate-400 self-center">
                  Commission: {p.commission_status || 'pending'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (!confirm('Candidate left the job? Mark them Available again as an active job seeker.')) return;
                    await markCandidateAvailable(p.candidate_id);
                    await supabase.from('placements').update({ status: 'left' }).eq('id', p.id);
                    load();
                  }}
                >
                  Available again
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
