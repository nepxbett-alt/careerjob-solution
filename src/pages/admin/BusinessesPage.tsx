import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Building2 } from 'lucide-react';
import {
  getAllBusinessRequests,
  updateRequestStatus,
  createJobFromRequest,
  publishJob,
} from '../../services/businessService';
import { markBusinessContacted } from '../../services/opsService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';

export default function BusinessesPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const load = () => {
    setLoading(true);
    getAllBusinessRequests()
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const visible = filter === 'pending'
    ? requests.filter((r) => r.status === 'submitted' || r.status === 'under_review')
    : requests;

  const acceptAndCreateJob = async (req: any, publishNow: boolean) => {
    if (!user) return;
    const msg = publishNow
      ? 'Accept this request, create a job, and publish it for candidates?'
      : 'Accept this request and create a draft job (not visible to candidates yet)?';
    if (!confirm(msg)) return;
    setBusy(req.id);
    try {
      const job = await createJobFromRequest(req, user.id);
      if (publishNow) await publishJob(job.id);
      alert(publishNow ? 'Job published. Candidates can see it now.' : 'Draft job created. Publish from Jobs when ready.');
      load();
    } catch (e: any) {
      alert(e.message || 'Could not accept request');
    } finally {
      setBusy(null);
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Reject this hiring request?')) return;
    setBusy(id);
    try {
      await updateRequestStatus(id, 'rejected');
      load();
    } finally {
      setBusy(null);
    }
  };

  const markReview = async (id: string) => {
    setBusy(id);
    try {
      await updateRequestStatus(id, 'under_review');
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Hiring requests</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Business submits → CareerJob accepts → job created → publish for candidates
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border min-h-[36px] ${
            filter === 'pending' ? 'bg-[#0066FF] text-white border-[#0066FF]' : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          Pending
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border min-h-[36px] ${
            filter === 'all' ? 'bg-[#0066FF] text-white border-[#0066FF]' : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          All
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {!loading && visible.length === 0 && (
        <EmptyState
          title={filter === 'pending' ? 'No pending requests' : 'No hiring requests yet'}
          description="When a business submits a hiring request, it appears here for acceptance."
        />
      )}

      <div className="space-y-3">
        {visible.map((r) => {
          const pending = r.status === 'submitted' || r.status === 'under_review';
          const org = r.organizations;
          return (
            <article key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {r.position_title}
                    {r.number_required ? (
                      <span className="text-slate-500 font-normal"> × {r.number_required}</span>
                    ) : null}
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {r.location}
                    {r.job_type ? ` · ${String(r.job_type).replace('-', ' ')}` : ''}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden />
                <div>
                  <span className="font-medium text-slate-800">{org?.name || 'Business'}</span>
                  {org?.contact_person && <span className="text-slate-500"> · {org.contact_person}</span>}
                  {(org?.phone || r.contact_phone) && (
                    <a href={`tel:${org?.phone || r.contact_phone}`} className="flex items-center gap-1 text-[#0066FF] mt-0.5">
                      <Phone className="w-3.5 h-3.5" aria-hidden /> {org?.phone || r.contact_phone}
                    </a>
                  )}
                  {(r.business_name || r.contact_person) && !org && (
                    <span className="block text-slate-700">
                      {r.business_name || ''} {r.contact_person ? `· ${r.contact_person}` : ''}
                    </span>
                  )}
                </div>
              </div>

              {(r.salary_min || r.salary_max || r.experience_required) && (
                <p className="text-xs text-slate-500 mb-2">
                  {r.salary_min && r.salary_max
                    ? `Salary Rs. ${Number(r.salary_min).toLocaleString()}–${Number(r.salary_max).toLocaleString()}`
                    : null}
                  {r.experience_required ? ` · Experience: ${r.experience_required}` : ''}
                </p>
              )}

              {(r.responsibilities || r.additional_requirements) && (
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mb-3 whitespace-pre-wrap">
                  {r.responsibilities || r.additional_requirements}
                </p>
              )}

              <p className="text-xs text-slate-400 mb-3">
                Submitted {new Date(r.created_at).toLocaleString()}
              </p>

              {pending && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!!busy}
                    onClick={async () => {
                      setBusy(r.id);
                      try {
                        await markBusinessContacted(r.id, 'Called business', user?.id);
                        load();
                      } catch (e: any) {
                        alert(e.message || 'Could not mark contacted');
                      } finally {
                        setBusy(null);
                      }
                    }}
                  >
                    Mark contacted
                  </Button>
                  <Button size="sm" disabled={!!busy} loading={busy === r.id} onClick={() => acceptAndCreateJob(r, true)}>
                    Accept & publish job
                  </Button>
                  <Button size="sm" variant="outline" disabled={!!busy} onClick={() => acceptAndCreateJob(r, false)}>
                    Accept as draft
                  </Button>
                  {r.status === 'submitted' && (
                    <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => markReview(r.id)}>
                      Mark under review
                    </Button>
                  )}
                  <Button size="sm" variant="danger" disabled={!!busy} onClick={() => reject(r.id)}>
                    Reject
                  </Button>
                </div>
              )}

              {r.status === 'accepted' && (
                <Link to="/admin/jobs">
                  <Button size="sm" variant="outline">Open jobs →</Button>
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
