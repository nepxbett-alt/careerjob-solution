import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Phone, FileText, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getSignedCVUrl } from '../../services/candidateService';
import { setSeekerStatus } from '../../services/candidateService';
import { applyToJob, getAllApplications, updateApplicationStatus, rejectApplication } from '../../services/applicationService';
import { searchJobs, type Job } from '../../services/jobService';
import { Button } from '../../components/ui/Button';
import { CvBuilder } from '../../components/CvBuilder';
import { saveCandidateCvFields, uploadCandidateFile } from '../../services/candidateService';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface Candidate {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  location: string | null;
  education: string | null;
  experience_years: number | null;
  skills: string[] | null;
  cv_url: string | null;
  desired_position: string | null;
  expected_salary: number | null;
  availability: string | null;
  seeker_status: string | null;
  profile_completion: number;
  registration_source: string | null;
  headline?: string | null;
  bio?: string | null;
  experience_notes?: string | null;
  languages?: string[] | null;
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<Candidate | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvBusy, setCvBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { user } = useAuth();
  const [activity, setActivity] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [sendOpen, setSendOpen] = useState(false);
  const [wpName, setWpName] = useState('');
  const [wpPos, setWpPos] = useState('');
  const [wpSalary, setWpSalary] = useState('');
  const [wpNotes, setWpNotes] = useState('');
  const [trialDays, setTrialDays] = useState('7');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: cand }, allApps, jobRes] = await Promise.all([
      supabase.from('candidate_profiles').select('*').eq('id', id).maybeSingle(),
      getAllApplications().catch(() => []),
      searchJobs({ location: 'Pokhara', page: 1, limit: 30 }).catch(() => ({ jobs: [] as Job[] })),
    ]);
    setC(cand as Candidate | null);
    setApps((allApps as any[]).filter((a) => a.candidate_id === id));
    // simple match: title/desired overlap
    const desired = ((cand as any)?.desired_position || '').toLowerCase();
    const skills = (((cand as any)?.skills || []) as string[]).map((s) => s.toLowerCase());
    const matched = (jobRes.jobs || []).filter((j) => {
      const t = j.title.toLowerCase();
      if (desired && t.includes(desired.split(' ')[0])) return true;
      if (skills.some((s) => s && t.includes(s))) return true;
      return true; // still show Pokhara jobs as options
    });
    setJobs(matched.slice(0, 8));
    try {
      const act = await getActivity('candidate', id);
      setActivity(act);
      const { data: wa } = await supabase
        .from('workplace_assignments')
        .select('*')
        .eq('candidate_id', id)
        .order('created_at', { ascending: false });
      setAssignments(wa || []);
    } catch { /* tables may not exist until migration */ }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const openCv = async () => {
    if (!c?.cv_url) return;
    setCvBusy(true);
    try {
      const url = await getSignedCVUrl(c.cv_url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      alert('Could not open CV. Check storage permissions.');
    } finally {
      setCvBusy(false);
    }
  };

  const applyJob = async (jobId: string) => {
    if (!c) return;
    if (!confirm('Apply this candidate to the selected job?')) return;
    setBusy(true);
    setMsg(null);
    try {
      await applyToJob({ jobId, candidateId: c.id });
      setMsg('Application created.');
      load();
    } catch (e: any) {
      alert(e.message || 'Apply failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500 p-4">Loading candidate…</p>;
  if (!c) {
    return (
      <div className="p-4">
        <p className="text-slate-600 mb-3">Candidate not found.</p>
        <Link to="/admin/candidates"><Button variant="outline">Back</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <Link to="/admin/candidates" className="inline-flex items-center gap-1 text-sm text-[#0066FF] font-medium">
        <ArrowLeft className="w-4 h-4" /> Candidates
      </Link>

      <header className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{c.full_name}</h1>
            <p className="text-sm text-slate-600 mt-1">
              {c.desired_position || 'No desired position'} · {c.location || 'Pokhara'}
            </p>
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <StatusBadge status={c.seeker_status || 'active'} />
              {c.registration_source === 'walk_in' && (
                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Walk-in</span>
              )}
              <span className="text-xs text-slate-400">Profile {c.profile_completion}%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {c.phone && (
              <a href={`tel:${c.phone}`}>
                <Button size="sm" variant="outline"><Phone className="w-3.5 h-3.5" /> {c.phone}</Button>
              </a>
            )}
            {c.cv_url ? (
              <Button size="sm" onClick={openCv} loading={cvBusy}>
                <FileText className="w-3.5 h-3.5" /> View CV
              </Button>
            ) : (
              <span className="text-sm text-slate-400 self-center">CV not uploaded</span>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
          <div>
            <dt className="text-xs text-slate-400">Expected salary</dt>
            <dd className="font-medium">{c.expected_salary != null ? `NPR ${c.expected_salary.toLocaleString()}` : '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Experience</dt>
            <dd className="font-medium">{c.experience_years != null ? `${c.experience_years} yrs` : '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Education</dt>
            <dd className="font-medium truncate">{c.education || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Availability</dt>
            <dd className="font-medium">{c.availability || '—'}</dd>
          </div>
        </dl>
        {c.skills && c.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {c.skills.map((s) => (
              <span key={s} className="text-xs bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{s}</span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {c.seeker_status === 'employed' ? (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                await setSeekerStatus(c.id, 'active');
                load();
              }}
            >
              Available again
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                await setSeekerStatus(c.id, 'employed');
                load();
              }}
            >
              Mark employed
            </Button>
          )}
        </div>
      </header>

      {msg && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{msg}</p>}

      {/* Suitable jobs */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Suitable jobs (Pokhara)</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-slate-500">No published jobs right now.</p>
        ) : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 border border-slate-100 rounded-xl p-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900">{j.title}</p>
                  <p className="text-xs text-slate-500">
                    {j.location}
                    {j.salary_display ? ` · ${j.salary_display}` : ''}
                  </p>
                </div>
                <Button size="sm" disabled={busy} onClick={() => applyJob(j.id)}>
                  Apply candidate
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Link to="/admin/jobs" className="inline-block text-sm text-[#0066FF] font-medium mt-3">All jobs →</Link>
      </section>


      {/* Ops workflow */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-slate-900">Recruitment actions</h2>
        <p className="text-xs text-slate-500">
          Status: <StatusBadge status={(c as any).ops_status || c.seeker_status || 'new_request'} />
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              await markCandidateContacted(c.id, undefined, user?.id);
              setMsg('Marked contacted');
              load();
            } catch (e: any) { alert(e.message); }
            finally { setBusy(false); }
          }}>Contacted</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={async () => {
            await setCandidateOpsStatus(c.id, 'looking_for_job', undefined, user?.id);
            load();
          }}>Looking for job</Button>
          <Button size="sm" onClick={() => setSendOpen(!sendOpen)}>Send to workplace</Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={async () => {
            await setCandidateOpsStatus(c.id, 'active_job_seeker', undefined, user?.id);
            setMsg('Active job seeker');
            load();
          }}>Active seeker</Button>
        </div>

        {sendOpen && (
          <div className="border border-slate-100 rounded-xl p-3 space-y-2 bg-slate-50">
            <input className="cj-input" placeholder="Workplace name *" value={wpName} onChange={(e) => setWpName(e.target.value)} />
            <input className="cj-input" placeholder="Position *" value={wpPos} onChange={(e) => setWpPos(e.target.value || c.desired_position || '')} />
            <input className="cj-input" type="number" placeholder="Salary NPR" value={wpSalary} onChange={(e) => setWpSalary(e.target.value)} />
            <textarea className="cj-input min-h-[60px] py-2" placeholder="Notes" value={wpNotes} onChange={(e) => setWpNotes(e.target.value)} />
            <Button size="sm" disabled={busy || !wpName.trim() || !wpPos.trim()} loading={busy} onClick={async () => {
              setBusy(true);
              try {
                await sendToWorkplace({
                  candidateId: c.id,
                  workplaceName: wpName.trim(),
                  positionTitle: wpPos.trim(),
                  salaryAmount: wpSalary ? parseInt(wpSalary, 10) : undefined,
                  notes: wpNotes || undefined,
                  createdBy: user?.id,
                });
                setMsg('Sent to workplace — follow-up reminder set for tomorrow');
                setSendOpen(false);
                setWpName(''); setWpPos(''); setWpSalary(''); setWpNotes('');
                load();
              } catch (e: any) { alert(e.message || 'Failed — run SQL migration?'); }
              finally { setBusy(false); }
            }}>Confirm send</Button>
          </div>
        )}

        {assignments.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase">Workplace history</p>
            {assignments.map((a) => (
              <div key={a.id} className="border border-slate-100 rounded-xl p-3 text-sm">
                <p className="font-medium">{a.position_title} @ {a.workplace_name}</p>
                <p className="text-xs text-slate-500">
                  Sent {a.sent_at} · Status {a.status}
                  {a.trial_end ? ` · Trial ends ${a.trial_end}` : ''}
                  {a.follow_up_date && !a.follow_up_done ? ` · Follow-up ${a.follow_up_date}` : ''}
                </p>
                {a.status === 'sent' && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button size="sm" variant="success" onClick={async () => {
                      await confirmWorkplaceStatus(a.id, 'placed', { actorId: user?.id });
                      load();
                    }}>Placed</Button>
                    <div className="flex items-center gap-1">
                      <select className="cj-input h-9 w-24" value={trialDays} onChange={(e) => setTrialDays(e.target.value)}>
                        <option value="3">3d</option>
                        <option value="7">7d</option>
                        <option value="15">15d</option>
                        <option value="30">30d</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={async () => {
                        await confirmWorkplaceStatus(a.id, 'trial', { trialDays: parseInt(trialDays, 10), actorId: user?.id });
                        load();
                      }}>Start trial</Button>
                    </div>
                  </div>
                )}
                {a.status === 'trial' && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button size="sm" variant="success" onClick={async () => {
                      await completeTrial(a.id, 'placed', { actorId: user?.id });
                      load();
                    }}>Trial → Placed</Button>
                    <Button size="sm" variant="danger" onClick={async () => {
                      await completeTrial(a.id, 'not_selected', { actorId: user?.id });
                      load();
                    }}>Not selected → Active seeker</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activity.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Timeline</p>
            <ul className="space-y-1.5">
              {activity.slice(0, 12).map((ev) => (
                <li key={ev.id} className="text-xs text-slate-600">
                  <span className="text-slate-400">{new Date(ev.created_at).toLocaleString()}</span>
                  {' · '}{ev.action}{ev.notes ? ` — ${ev.notes}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Applications */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Applications</h2>
        {apps.length === 0 ? (
          <p className="text-sm text-slate-500">No applications yet.</p>
        ) : (
          <ul className="space-y-3">
            {apps.map((a) => (
              <li key={a.id} className="border border-slate-100 rounded-xl p-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{a.jobs?.title || 'Job'}</p>
                    <p className="text-xs text-slate-500">{new Date(a.applied_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {a.status === 'applied' && (
                    <Button size="sm" variant="outline" onClick={async () => { await updateApplicationStatus(a.id, 'shortlisted'); load(); }}>
                      Shortlist
                    </Button>
                  )}
                  {['applied', 'under_review', 'shortlisted', 'interview'].includes(a.status) && (
                    <>
                      <Button size="sm" variant="success" onClick={async () => { await updateApplicationStatus(a.id, 'selected'); load(); }}>
                        Select
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          const reason = prompt('Reject reason: experience / skills / salary / interview / position_filled / other') || 'other';
                          await rejectApplication(a.id, reason);
                          load();
                        }}
                      >
                        Not selected
                      </Button>
                    </>
                  )}
                  {a.status === 'selected' && (
                    <Link to="/admin/placements">
                      <Button size="sm">Record hire →</Button>
                    </Link>
                  )}
                  {c.cv_url && (
                    <Button size="sm" variant="ghost" loading={cvBusy} onClick={openCv}>CV</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>


      {/* CV builder for walk-ins and admin edits */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm print:border-0">
        <h2 className="font-semibold text-slate-900 mb-3">Build / edit CV</h2>
        <div className="mb-4 print:hidden">
          <label className="cj-label">Upload CV file (PDF/DOC)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="text-sm"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f || !c) return;
              try {
                await uploadCandidateFile(c.id, f);
                setMsg('CV file uploaded.');
                load();
              } catch (err: any) {
                alert(err.message || 'Upload failed');
              }
            }}
          />
        </div>
        <CvBuilder
          key={c.id + (c.cv_url || '')}
          title="Candidate CV"
          showAi
          initial={{
            full_name: c.full_name,
            phone: c.phone,
            email: c.email || '',
            location: c.location || 'Pokhara',
            headline: (c as any).headline || '',
            bio: c.bio || (c as any).bio || '',
            education: c.education || '',
            experience_notes: (c as any).experience_notes || '',
            skills: (c.skills || []).join(', '),
            languages: ((c as any).languages || []).join?.(', ') || '',
            desired_position: c.desired_position || '',
          }}
          onSave={async (data) => {
            await saveCandidateCvFields(c.id, {
              full_name: data.full_name,
              phone: data.phone,
              email: data.email,
              location: data.location,
              headline: data.headline,
              bio: data.bio,
              education: data.education,
              skills: (data.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
              languages: (data.languages || '').split(',').map((s) => s.trim()).filter(Boolean),
              desired_position: data.desired_position,
              experience_notes: data.experience_notes,
            });
            setMsg('CV saved.');
            load();
          }}
        />
      </section>

    </div>
  );
}
