import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    applications: 0,
    shortlisted: 0,
    interviews: 0,
    jobs: 0,
    requests: 0,
    placements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [apps, short, jobs, reqs, places, interviews] = await Promise.all([
        supabase.from('applications').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'shortlisted'),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('business_requests').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
        supabase.from('placements').select('id', { count: 'exact', head: true }),
        supabase.from('interviews').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
      ]);
      setStats({
        applications: apps.count || 0,
        shortlisted: short.count || 0,
        interviews: interviews.count || 0,
        jobs: jobs.count || 0,
        requests: reqs.count || 0,
        placements: places.count || 0,
      });
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Applications', value: stats.applications, to: '/admin/applications' },
    { label: 'Shortlisted', value: stats.shortlisted, to: '/admin/applications?status=shortlisted' },
    { label: 'Interviews', value: stats.interviews, to: '/admin/interviews' },
    { label: 'Active Jobs', value: stats.jobs, to: '/admin/jobs' },
    { label: 'Pending Requests', value: stats.requests, to: '/admin/businesses' },
    { label: 'Placements', value: stats.placements, to: '/admin/placements' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">CareerJob agency overview · live data</p>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link
              key={c.label}
              to={c.to}
              className="bg-white border rounded-xl p-4 hover:border-[#0066FF]/40 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-900">{c.value}</div>
              <div className="text-sm text-gray-500 mt-1">{c.label}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
