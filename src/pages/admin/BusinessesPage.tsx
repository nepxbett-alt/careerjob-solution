import { useEffect, useState } from 'react';
import { getAllBusinessRequests, updateRequestStatus, createJobFromRequest, publishJob } from '../../services/businessService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export default function BusinessesPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAllBusinessRequests()
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const acceptAndCreateJob = async (req: any) => {
    if (!user || !confirm('Accept request and create draft job?')) return;
    setBusy(req.id);
    try {
      const job = await createJobFromRequest(req, user.id);
      if (confirm('Job created as draft. Publish it now so candidates can see it?')) {
        await publishJob(job.id);
      }
      load();
    } catch (e: any) {
      alert(e.message || 'Failed');
    } finally {
      setBusy(null);
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Reject this request?')) return;
    setBusy(id);
    try {
      await updateRequestStatus(id, 'rejected');
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Business Hiring Requests</h1>
      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && requests.length === 0 && <p className="text-gray-500">No requests yet.</p>}
      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="bg-white border rounded-xl p-4">
            <div className="font-semibold">{r.position_title} × {r.number_required}</div>
            <div className="text-sm text-gray-600">{r.location} · {r.organizations?.name || 'Business'}</div>
            <div className="text-xs text-gray-400 mt-1">
              Status: <span className="capitalize">{r.status.replace('_', ' ')}</span> · {new Date(r.created_at).toLocaleDateString()}
            </div>
            {r.status === 'submitted' || r.status === 'under_review' ? (
              <div className="flex gap-2 mt-3">
                <Button size="sm" disabled={busy === r.id} onClick={() => acceptAndCreateJob(r)}>
                  Accept & Create Job
                </Button>
                <Button size="sm" variant="danger" disabled={busy === r.id} onClick={() => reject(r.id)}>
                  Reject
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
