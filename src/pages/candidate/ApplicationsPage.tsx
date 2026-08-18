import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyCandidateProfile } from '../../services/candidateService';
import { applyToJob, getMyApplications, type Application } from '../../services/applicationService';
import { getJobById } from '../../services/jobService';
import { Button } from '../../components/ui/Button';

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  selected: 'Selected',
  placed: 'Placed',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  closed: 'Closed',
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const applyJobId = params.get('apply');
  const navigate = useNavigate();

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [cover, setCover] = useState('');
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  const load = async () => {
    if (!user) return;
    const profile = await getMyCandidateProfile(user.id);
    if (!profile) {
      setNeedsProfile(true);
      setLoading(false);
      return;
    }
    setCandidateId(profile.id);
    setNeedsProfile(false);
    const list = await getMyApplications(profile.id);
    setApps(list);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (applyJobId) {
      getJobById(applyJobId).then((j) => setJobTitle(j.title)).catch(() => {});
    }
  }, [applyJobId]);

  const handleApply = async () => {
    if (!candidateId || !applyJobId) return;
    setApplying(true);
    setApplyError(null);
    try {
      await applyToJob({ jobId: applyJobId, candidateId, coverMessage: cover });
      setApplySuccess(true);
      await load();
      setTimeout(() => navigate('/candidate/applications', { replace: true }), 1500);
    } catch (err: any) {
      setApplyError(err.message || 'Could not submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading…</div>;

  if (needsProfile) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-gray-700">Complete your profile before applying.</p>
        <Link to="/candidate/profile"><Button>Complete Profile</Button></Link>
      </div>
    );
  }

  // Apply confirmation UI
  if (applyJobId && !applySuccess) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-2">Apply for job</h1>
        <p className="text-gray-600 mb-4">
          You are applying for: <strong>{jobTitle || '…'}</strong>
        </p>
        <textarea
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="Optional message to CareerJob"
          className="w-full h-24 px-3 py-2 border rounded-lg mb-4"
        />
        {applyError && <p className="text-sm text-red-600 mb-3">{applyError}</p>}
        <div className="flex gap-3">
          <Button onClick={handleApply} disabled={applying} fullWidth>
            {applying ? 'Submitting…' : 'Submit Application'}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (applySuccess) {
    return (
      <div className="p-4 text-center">
        <p className="text-green-600 font-medium mb-2">Application submitted!</p>
        <p className="text-sm text-gray-500">CareerJob will review your application.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Applications</h1>
      {apps.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">You haven&apos;t applied for any jobs yet.</p>
          <Link to="/jobs"><Button>Explore Jobs</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="bg-white border rounded-xl p-4">
              <div className="font-semibold">{app.jobs?.title || 'Job'}</div>
              <div className="text-sm text-gray-500">{app.jobs?.location}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {STATUS_LABELS[app.status] || app.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(app.applied_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
