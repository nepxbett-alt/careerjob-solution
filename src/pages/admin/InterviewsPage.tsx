import { useEffect, useState } from 'react';
import { getAllInterviews, scheduleInterview, updateInterviewStatus, type Interview } from '../../services/interviewService';
import { getAllApplications, type Application } from '../../services/applicationService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export default function InterviewsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [shortlisted, setShortlisted] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState('');
  const [when, setWhen] = useState('');
  const [location, setLocation] = useState('Pokhara');
  const [instructions, setInstructions] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [iv, apps] = await Promise.all([
        getAllInterviews(),
        getAllApplications({ status: 'shortlisted' }),
      ]);
      setInterviews(iv);
      setShortlisted(apps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const app = shortlisted.find((a) => a.id === selectedApp);
    if (!app || !when) return;
    setBusy(true);
    try {
      await scheduleInterview({
        applicationId: app.id,
        candidateId: app.candidate_id,
        jobId: app.job_id,
        scheduledAt: new Date(when).toISOString(),
        location,
        instructions,
        createdBy: user?.id,
      });
      setShowForm(false);
      setSelectedApp('');
      setWhen('');
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">Interviews</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Schedule interview'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSchedule} className="bg-white border rounded-xl p-4 mb-6 space-y-3 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Shortlisted application</label>
            <select
              required
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="w-full h-10 px-3 border rounded-lg bg-white text-sm"
            >
              <option value="">Select…</option>
              {shortlisted.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.candidate_profiles?.full_name} — {a.jobs?.title} ({a.jobs?.location})
                </option>
              ))}
            </select>
            {shortlisted.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No shortlisted applications. Shortlist someone first.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date & time</label>
            <input
              type="datetime-local"
              required
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="w-full h-10 px-3 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-10 px-3 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instructions (for candidate)</label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full h-20 px-3 py-2 border rounded-lg text-sm" />
          </div>
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Schedule'}</Button>
        </form>
      )}

      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && interviews.length === 0 && <p className="text-gray-500">No interviews scheduled.</p>}

      <div className="space-y-2">
        {interviews.map((iv) => (
          <div key={iv.id} className="bg-white border rounded-xl p-4">
            <div className="font-semibold">{iv.candidate_profiles?.full_name}</div>
            <div className="text-sm text-gray-600">{iv.jobs?.title} · {iv.jobs?.location}</div>
            <div className="text-sm mt-1">
              {new Date(iv.scheduled_at).toLocaleString()}
              {iv.location ? ` · ${iv.location}` : ''}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <span className="text-xs capitalize bg-slate-100 px-2 py-0.5 rounded">{iv.status.replace('_', ' ')}</span>
              {iv.status === 'scheduled' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => updateInterviewStatus(iv.id, 'completed').then(load)}>
                    Complete
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => updateInterviewStatus(iv.id, 'cancelled').then(load)}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
