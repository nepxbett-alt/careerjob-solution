import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Briefcase, Calendar, Award, ArrowRight, AlertCircle, Banknote,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface RecentApp {
  id: string;
  status: string;
  applied_at: string;
  jobs?: { title: string } | null;
  candidate_profiles?: { full_name: string; phone: string } | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    candidates: 0,
    activeSeekers: 0,
    openJobs: 0,
    applications: 0,
    applied: 0,
    interviewsToday: 0,
    hiredMonth: 0,
    day30Pending: 0,
    commissionDue: 0,
  });
  const [recent, setRecent] = useState<RecentApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [
        candidates,
        activeSeekers,
        openJobs,
        applications,
        applied,
        interviewsToday,
        hiredMonth,
        day30,
        commissions,
        recentApps,
      ] = await Promise.all([
        supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('candidate_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('seeker_status', 'active'),
        supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase.from('applications').select('id', { count: 'exact', head: true }),
        supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'applied'),
        supabase
          .from('interviews')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'scheduled')
          .gte('scheduled_at', todayStart.toISOString())
          .lte('scheduled_at', todayEnd.toISOString()),
        supabase
          .from('placements')
          .select('id', { count: 'exact', head: true })
          .gte('joining_date', startOfMonth.toISOString().slice(0, 10)),
        supabase
          .from('placements')
          .select('id', { count: 'exact', head: true })
          .in('day30_status', ['pending', 'approaching']),
        supabase
          .from('placements')
          .select('commission_amount')
          .in('commission_status', ['pending', 'invoiced'])
          .eq('day30_status', 'completed'),
        supabase
          .from('applications')
          .select('id, status, applied_at, jobs(title), candidate_profiles(full_name, phone)')
          .order('applied_at', { ascending: false })
          .limit(8),
      ]);

      const commissionDue = ((commissions.data || []) as { commission_amount: number | null }[]).reduce(
        (sum, row) => sum + (row.commission_amount || 0),
        0
      );

      setStats({
        candidates: candidates.count || 0,
        activeSeekers: activeSeekers.count || 0,
        openJobs: openJobs.count || 0,
        applications: applications.count || 0,
        applied: applied.count || 0,
        interviewsToday: interviewsToday.count || 0,
        hiredMonth: hiredMonth.count || 0,
        day30Pending: day30.count || 0,
        commissionDue,
      });
      setRecent((recentApps.data || []) as unknown as RecentApp[]);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Candidates', value: stats.candidates, to: '/admin/candidates', icon: Users, hint: 'All profiles' },
    { label: 'Active seekers', value: stats.activeSeekers, to: '/admin/candidates', icon: Users, hint: 'Looking for work', urgent: false },
    { label: 'Open jobs', value: stats.openJobs, to: '/admin/jobs', icon: Briefcase, hint: 'Published in Pokhara' },
    { label: 'New applications', value: stats.applied, to: '/admin/applications?status=applied', icon: Briefcase, hint: 'Need review', urgent: stats.applied > 0 },
    { label: 'Interviews today', value: stats.interviewsToday, to: '/admin/interviews', icon: Calendar, hint: 'Scheduled today', urgent: stats.interviewsToday > 0 },
    { label: 'Hired this month', value: stats.hiredMonth, to: '/admin/placements', icon: Award, hint: 'Joining dates' },
    { label: '30-day pending', value: stats.day30Pending, to: '/admin/placements', icon: Calendar, hint: 'Milestone tracking', urgent: stats.day30Pending > 0 },
    {
      label: 'Commission due',
      value: stats.commissionDue > 0 ? `NPR ${stats.commissionDue.toLocaleString()}` : '0',
      to: '/admin/placements',
      icon: Banknote,
      hint: 'After 30 days',
      urgent: stats.commissionDue > 0,
    },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Recruitment pipeline</h1>
        <p className="text-sm text-slate-500 mt-1">
          Where is each candidate? Applied → Shortlist → Interview → Hire → 30 days → Commission
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          {(stats.applied > 0 || stats.interviewsToday > 0 || stats.day30Pending > 0) && (
            <div className="mb-5 flex flex-wrap items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-900 text-sm">Needs attention</p>
                <p className="text-sm text-amber-800/90 mt-0.5">
                  {[
                    stats.applied > 0 && `${stats.applied} new application${stats.applied !== 1 ? 's' : ''}`,
                    stats.interviewsToday > 0 && `${stats.interviewsToday} interview${stats.interviewsToday !== 1 ? 's' : ''} today`,
                    stats.day30Pending > 0 && `${stats.day30Pending} hire${stats.day30Pending !== 1 ? 's' : ''} on 30-day track`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.applied > 0 && (
                  <Link to="/admin/applications?status=applied">
                    <Button size="sm">Review apps</Button>
                  </Link>
                )}
                {stats.interviewsToday > 0 && (
                  <Link to="/admin/interviews">
                    <Button size="sm" variant="outline">Interviews</Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {cards.map((c) => (
              <Link
                key={c.label}
                to={c.to}
                className={`bg-white border rounded-2xl p-4 hover:border-[#0066FF]/40 hover:shadow-sm transition-all ${
                  c.urgent ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.label}</p>
                    <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{c.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{c.hint}</p>
                  </div>
                  <c.icon className="w-5 h-5 text-slate-400" aria-hidden />
                </div>
              </Link>
            ))}
          </div>

          {/* Simple pipeline legend */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 overflow-x-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Core pipeline</p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 min-w-max">
              {['Applied', 'Shortlisted', 'Interview', 'Selected', 'Hired', '30 days', 'Commission'].map((step, i) => (
                <span key={step} className="flex items-center gap-1.5">
                  {i > 0 && <ArrowRight className="w-3 h-3 text-slate-300" aria-hidden />}
                  <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">{step}</span>
                </span>
              ))}
            </div>
          </div>

          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-sm">Latest applications</h2>
              <Link to="/admin/applications" className="text-xs font-medium text-[#0066FF] inline-flex items-center gap-0.5">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No applications yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((a) => (
                  <li key={a.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {a.candidate_profiles?.full_name || 'Candidate'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {a.jobs?.title || 'Job'} · {new Date(a.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
