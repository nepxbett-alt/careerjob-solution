import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyCandidateProfile } from '../../services/candidateService';
import { getSavedJobs, unsaveJob } from '../../services/savedJobService';
import { Button } from '../../components/ui/Button';

export default function SavedJobsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const profile = await getMyCandidateProfile(user.id);
      if (!profile) {
        setLoading(false);
        return;
      }
      setCandidateId(profile.id);
      const saved = await getSavedJobs(profile.id);
      setItems(saved);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [user]);

  const remove = async (jobId: string) => {
    if (!candidateId) return;
    await unsaveJob(candidateId, jobId);
    setItems((prev) => prev.filter((x) => x.job_id !== jobId));
  };

  if (loading) return <div className="p-4 text-gray-500">Loading…</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Saved Jobs</h1>
      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">You haven&apos;t saved any jobs.</p>
          <Link to="/jobs"><Button>Browse Jobs</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const job = item.jobs;
            const closed = job?.status && job.status !== 'published';
            return (
              <div key={item.id} className="bg-white border rounded-xl p-4">
                <div className="font-semibold">{job?.title || 'Job'}</div>
                <div className="text-sm text-gray-600">{job?.location}</div>
                {job?.salary_display && <div className="text-sm mt-1">{job.salary_display}</div>}
                {closed && <p className="text-xs text-amber-600 mt-1">Job closed</p>}
                <div className="flex gap-2 mt-3">
                  {!closed && job?.id && (
                    <Link to={`/jobs/${job.id}`}><Button size="sm">View</Button></Link>
                  )}
                  <Button size="sm" variant="outline" onClick={() => remove(item.job_id)}>Unsave</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
