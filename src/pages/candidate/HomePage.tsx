import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, User, Bookmark, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyCandidateProfile } from '../../services/candidateService';
import { getMyApplications } from '../../services/applicationService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { WhatsAppButton } from '../../components/WhatsAppButton';

export default function CandidateHomePage() {
  const { user, profile } = useAuth();
  const [completion, setCompletion] = useState(0);
  const [hasCv, setHasCv] = useState(false);
  const [apps, setApps] = useState<{ id: string; status: string; jobs?: { title: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const cp = await getMyCandidateProfile(user.id);
        if (cp) {
          setCompletion(cp.profile_completion || 0);
          setHasCv(!!cp.cv_url);
          const list = await getMyApplications(cp.id);
          setApps(list.slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const name = profile?.full_name?.split(' ')[0] || 'there';
  const needsProfile = completion < 60 || !hasCv;

  return (
    <div className="p-4 space-y-5">
      <header>
        <p className="text-sm text-slate-500">Welcome back</p>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Hi, {name}</h1>
      </header>

      {/* Next action */}
      {needsProfile && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900 text-sm mb-1">Finish your profile to apply faster</p>
          <p className="text-xs text-amber-800/80 mb-3">
            {completion}% complete{!hasCv ? ' · CV still needed' : ''}
          </p>
          <div className="h-1.5 bg-amber-100 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${completion}%` }} />
          </div>
          <Link to="/candidate/profile">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">Complete profile</Button>
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: '/jobs', icon: Briefcase, label: 'Find jobs', desc: 'Browse openings' },
          { to: '/candidate/applications', icon: FileText, label: 'Applications', desc: 'Track status' },
          { to: '/candidate/saved', icon: Bookmark, label: 'Saved', desc: 'Your shortlist' },
          { to: '/candidate/profile', icon: User, label: 'Profile', desc: 'Name, phone, CV' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-[#0066FF]/40 hover:shadow-sm transition-all min-h-[88px]"
          >
            <item.icon className="w-5 h-5 text-[#0066FF] mb-2" aria-hidden />
            <div className="font-semibold text-sm text-slate-900">{item.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent applications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Recent applications</h2>
          <Link to="/candidate/applications" className="text-sm text-[#0066FF] font-medium inline-flex items-center gap-0.5">
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading && <p className="text-sm text-slate-500">Loading…</p>}
        {!loading && apps.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
            <p className="text-sm text-slate-600 mb-3">You haven&apos;t applied yet.</p>
            <Link to="/jobs"><Button size="sm">Browse jobs</Button></Link>
          </div>
        )}
        <div className="space-y-2">
          {apps.map((a) => (
            <Link
              key={a.id}
              to="/candidate/applications"
              className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5"
            >
              <span className="font-medium text-sm text-slate-900 truncate">{a.jobs?.title || 'Job'}</span>
              <StatusBadge status={a.status} />
            </Link>
          ))}
        </div>
      </section>

      <div className="pt-2">
        <WhatsAppButton message="Hello CareerJob, I need help with my applications." label="Chat on WhatsApp" />
      </div>
    </div>
  );
}
