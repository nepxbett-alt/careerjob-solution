import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Users, Briefcase, Building2, Calendar, Award,
  ArrowRight, AlertCircle, Clock,
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
    applications: 0,
    applied: 0,
    shortlisted: 0,
    interviews: 0,
    jobs: 0,
    requests: 0,
    placements: 0,
    candidates: 0,
  });
  const [recent, setRecent] = useState<RecentApp[]>([]);
  const [pendingReqs, setPendingReqs] = useState<{ id: string; position_title: string; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        apps, applied, short, jobs, reqs, places, interviews, candidates, recentApps, pending,
      ] = await Promise.all([
        supabase.from('applications').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'applied'),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'shortlisted'),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('business_requests').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
        supabase.from('placements').select('id', { count: 'exact', head: true }),
        supabase.from('interviews').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('applications')
          .select('id, status, applied_at, jobs(title), candidate_profiles(full_name, phone)')
          .order('applied_at', { ascending: false })
          .limit(8),
        supabase
          .from('business_requests')
          .select('id, position_title, status, created_at')
          .in('status', ['submitted', 'under_review'])
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        applications: apps.count || 0,
        applied: applied.count || 0,
        shortlisted: short.count || 0,
        interviews: interviews.count || 0,
        jobs: jobs.count || 0,
        requests: reqs.count || 0,
        placements: places.count || 0,
        candidates: candidates.count || 0,
      });
      setRecent((recentApps.data || []) as unknown as RecentApp[]);
      setPendingReqs(pending.data || []);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'New applications', value: stats.applied, to: '/admin/applications?status=applied', icon: FileText, hint: 'Need review', urgent: stats.applied > 0 },
    { label: 'Shortlisted', value: stats.shortlisted, to: '/admin/applications?status=shortlisted', icon: Users, hint: 'Ready for interview' },
    { label: 'Interviews', value: stats.interviews, to: '/admin/interviews', icon: Calendar, hint: 'Scheduled' },
    { label: 'Open jobs', value: stats.jobs, to: '/admin/jobs', icon: Briefcase, hint: 'Published' },
    { label: 'Hiring requests', value: stats.requests, to: '/admin/businesses', icon: Building2, hint: 'Pending review', urgent: stats.requests > 0 },
    { label: 'Placements', value: stats.placements, to: '/admin/placements', icon: Award, hint: 'All time' },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Operations dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Work queue for CareerJob staff — review applications, requests, interviews, placements.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading metrics…</p>
      ) : (
        <>
          {/* Attention banner */}
          {(stats.applied > 0 || stats.requests > 0) && (
            <div className="mb-5 flex flex-wrap items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-900 text-sm">Needs attention</p>
                <p className="text-sm text-amber-800/90 mt-0.5">
                  {stats.applied > 0 && <>{stats.applied} new application{stats.applied !== 1 ? 's' : ''}</>}
                  {stats.applied > 0 && stats.requests > 0 && ' · '}
                  {stats.requests > 0 && <>{stats.requests} hiring request{stats.requests !== 1 ? 's' : ''}</>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.applied > 0 && (
                  <Link to="/admin/applications?status=applied">
                    <Button size="sm">Review applications</Button>
                  </Link>
                )}
                {stats.requests > 0 && (
                  <Link to="/admin/businesses">
                    <Button size="sm" variant="outline">Review requests</Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
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
                    <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{c.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{c.hint}</p>
                  </div>
                  <c.icon className="w-5 h-5 text-slate-400" aria-hidden />
                </div>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent applications */}
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

            {/* Pending business requests */}
            <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm">Pending hiring requests</h2>
                <Link to="/admin/businesses" className="text-xs font-medium text-[#0066FF] inline-flex items-center gap-0.5">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {pendingReqs.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No pending requests.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {pendingReqs.map((r) => (
                    <li key={r.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{r.position_title}</p>
                        <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden />
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            {stats.candidates} candidate profiles · {stats.applications} total applications
          </p>
        </>
      )}
    </div>
  );
}
