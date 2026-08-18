import { useEffect, useState } from 'react';
import { getAllPlacements, createPlacement, type Placement } from '../../services/placementService';
import { getAllApplications, type Application } from '../../services/applicationService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export default function PlacementsPage() {
  const { user } = useAuth();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selected, setSelected] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [appId, setAppId] = useState('');
  const [joining, setJoining] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

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

  useEffect(() => { load(); }, []);

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
        notes: notes || undefined,
        staffId: user?.id,
      });
      setShowForm(false);
      setAppId('');
      load();
    } catch (err: any) {
      alert(err.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">Placements</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Record placement'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-4 mb-6 space-y-3 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Selected candidate</label>
            <select required value={appId} onChange={(e) => setAppId(e.target.value)} className="w-full h-10 px-3 border rounded-lg bg-white text-sm">
              <option value="">Select…</option>
              {selected.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.candidate_profiles?.full_name} — {a.jobs?.title}
                </option>
              ))}
            </select>
            {selected.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">Mark an application as Selected first.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Joining date</label>
            <input type="date" value={joining} onChange={(e) => setJoining(e.target.value)} className="w-full h-10 px-3 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-20 px-3 py-2 border rounded-lg text-sm" />
          </div>
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Confirm placement'}</Button>
        </form>
      )}

      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && placements.length === 0 && <p className="text-gray-500">No placements yet.</p>}

      <div className="space-y-2">
        {placements.map((p) => (
          <div key={p.id} className="bg-white border rounded-xl p-4">
            <div className="font-semibold">{p.candidate_profiles?.full_name}</div>
            <div className="text-sm text-gray-600">{p.jobs?.title} · {p.jobs?.location}</div>
            <div className="text-xs text-gray-400 mt-1">
              Placed {p.placement_date}
              {p.joining_date ? ` · Joining ${p.joining_date}` : ''}
              {' · '}{p.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
