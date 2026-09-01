import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Users, Building2, AlertCircle, CheckCircle2,
  UserPlus, FileText, Briefcase, MessageCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getDueReminders, completeReminder } from '../../services/opsService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CONTACT } from '../../lib/config';

function waLink(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null;
  const n = digits.startsWith('977') ? digits : `977${digits.replace(/^0/, '')}`;
  return `https://wa.me/${n}`;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newCandidates: 0,
    newBusiness: 0,
    sent: 0,
    trial: 0,
    placed: 0,
    activeSeekers: 0,
    openJobs: 0,
  });
  const [reminders, setReminders] = useState<any[]>([]);
  const [newCands, setNewCands] = useState<any[]>([]);
  const [newBiz, setNewBiz] = useState<any[]>([]);
  const [recentSent, setRecentSent] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const [
      nc,
      nb,
      sent,
      trial,
      placed,
      active,
      jobs,
      due,
      candList,
      bizList,
      waList,
    ] = await Promise.all([
      supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).or('ops_status.eq.new_request,ops_status.is.null'),
      supabase.from('business_requests').select('id', { count: 'exact', head: true }).or('ops_status.eq.new_request,ops_status.is.null,status.eq.submitted'),
      supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('ops_status', 'sent_to_workplace'),
      supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('ops_status', 'trial'),
      supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).eq('ops_status', 'placed'),
      supabase.from('candidate_profiles').select('id', { count: 'exact', head: true }).in('ops_status', ['active_job_seeker', 'looking_for_job', 'contacted']),
      supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      getDueReminders().catch(() => []),
      supabase
        .from('candidate_profiles')
        .select('id, full_name, phone, desired_position, location, created_at, ops_status')
        .or('ops_status.eq.new_request,ops_status.is.null')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('business_requests')
        .select('id, business_name, contact_person, contact_phone, position_title, number_required, location, ops_status, status, created_at')
        .or('ops_status.eq.new_request,ops_status.is.null,status.eq.submitted')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('workplace_assignments')
        .select('id, workplace_name, position_title, sent_at, status, follow_up_date, candidate_id, candidate_profiles(full_name, phone)')
        .in('status', ['sent', 'trial'])
        .order('sent_at', { ascending: false })
        .limit(8),
    ]);

    setStats({
      newCandidates: nc.count || 0,
      newBusiness: nb.count || 0,
      sent: sent.count || 0,
      trial: trial.count || 0,
      placed: placed.count || 0,
      activeSeekers: active.count || 0,
      openJobs: jobs.count || 0,
    });
    setReminders(due || []);
    setNewCands(candList.data || []);
    setNewBiz(bizList.data || []);
    setRecentSent(waList.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl pb-10">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Today — recruitment desk</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Who to call · Who was sent · Whose trial ends · Who is placed
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link to="/admin/walk-in">
          <Button size="sm"><UserPlus className="w-3.5 h-3.5" /> Walk-in</Button>
        </Link>
        <Link to="/admin/create-cv">
          <Button size="sm" variant="outline"><FileText className="w-3.5 h-3.5" /> Create CV</Button>
        </Link>
        <Link to="/admin/jobs">
          <Button size="sm" variant="outline"><Briefcase className="w-3.5 h-3.5" /> Jobs</Button>
        </Link>
        <a href={`https://wa.me/977${CONTACT.whatsapp?.replace(/\D/g, '').replace(/^977/, '')}`} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="ghost"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp office</Button>
        </a>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 mb-6">
            {[
              { label: 'New candidates', value: stats.newCandidates, to: '/admin/candidates', urgent: stats.newCandidates > 0 },
              { label: 'New business', value: stats.newBusiness, to: '/admin/businesses', urgent: stats.newBusiness > 0 },
              { label: 'Open jobs', value: stats.openJobs, to: '/admin/jobs' },
              { label: 'Sent to workplace', value: stats.sent, to: '/admin/placements' },
              { label: 'On trial', value: stats.trial, to: '/admin/placements', urgent: stats.trial > 0 },
              { label: 'Placed', value: stats.placed, to: '/admin/placements' },
              { label: 'Active seekers', value: stats.activeSeekers, to: '/admin/candidates' },
            ].map((c) => (
              <Link
                key={c.label}
                to={c.to}
                className={`bg-white border rounded-xl p-3 hover:border-[#0066FF]/40 transition-colors ${
                  c.urgent ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'
                }`}
              >
                <p className="text-[10px] uppercase tracking-wide text-slate-500 font-medium leading-tight">{c.label}</p>
                <p className="text-xl font-bold tabular-nums text-slate-900 mt-0.5">{c.value}</p>
              </Link>
            ))}
          </div>

          {reminders.length > 0 && (
            <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" aria-hidden />
                <h2 className="font-semibold text-amber-900 text-sm">Due today / overdue ({reminders.length})</h2>
              </div>
              <ul className="space-y-2">
                {reminders.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 bg-white/80 rounded-xl px-3 py-2.5 border border-amber-100"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{r.title}</p>
                      <p className="text-xs text-slate-500">
                        {r.candidate_profiles?.full_name || ''} · Due {r.due_date}
                        {r.body ? ` · ${r.body}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {r.candidate_id && (
                        <Link to={`/admin/candidates/${r.candidate_id}`}>
                          <Button size="sm" variant="outline">Open</Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await completeReminder(r.id);
                          load();
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0066FF]" /> New candidate requests
                </h2>
                <Link to="/admin/candidates" className="text-xs font-medium text-[#0066FF]">
                  All
                </Link>
              </div>
              {newCands.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No new requests. Walk-in or public form will appear here.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {newCands.map((c) => {
                    const wa = waLink(c.phone);
                    return (
                      <li key={c.id} className="px-4 py-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/admin/candidates/${c.id}`}
                            className="text-sm font-medium text-slate-900 hover:text-[#0066FF] truncate block"
                          >
                            {c.full_name || 'Candidate'}
                          </Link>
                          <p className="text-xs text-slate-500 truncate">
                            {c.desired_position || 'Any role'} · {c.location || 'Pokhara'}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {c.phone && (
                            <a href={`tel:${c.phone}`} aria-label="Call">
                              <Button size="sm" variant="outline">
                                <Phone className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          )}
                          {wa && (
                            <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                              <Button size="sm" variant="ghost">
                                <MessageCircle className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          )}
                          <Link to={`/admin/candidates/${c.id}`}>
                            <Button size="sm">Open</Button>
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0066FF]" /> New business requests
                </h2>
                <Link to="/admin/businesses" className="text-xs font-medium text-[#0066FF]">
                  All
                </Link>
              </div>
              {newBiz.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No new hiring requests.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {newBiz.map((b) => (
                    <li key={b.id} className="px-4 py-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {b.business_name || b.contact_person || 'Business'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {b.position_title || 'Staff'} ×{b.number_required || 1} · {b.location || 'Pokhara'}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0 items-center">
                        {b.contact_phone && (
                          <a href={`tel:${b.contact_phone}`}>
                            <Button size="sm" variant="outline">
                              <Phone className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        )}
                        <StatusBadge status={b.ops_status || b.status || 'pending'} />
                        <Link to="/admin/businesses">
                          <Button size="sm" variant="ghost">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Active workplace referrals */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold">Active workplace referrals</h2>
              <Link to="/admin/placements" className="text-xs font-medium text-[#0066FF]">
                Workplace
              </Link>
            </div>
            {recentSent.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                No one currently sent or on trial. Open a candidate → Send to workplace.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentSent.map((w) => {
                  const name = (w.candidate_profiles as any)?.full_name || 'Candidate';
                  const phone = (w.candidate_profiles as any)?.phone;
                  return (
                    <li key={w.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {name} → {w.workplace_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {w.position_title} · Sent {w.sent_at}
                          {w.follow_up_date ? ` · Follow-up ${w.follow_up_date}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <StatusBadge status={w.status || 'sent'} />
                        {phone && (
                          <a href={`tel:${phone}`}>
                            <Button size="sm" variant="outline">
                              <Phone className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        )}
                        {w.candidate_id && (
                          <Link to={`/admin/candidates/${w.candidate_id}`}>
                            <Button size="sm">Open</Button>
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="flex flex-wrap gap-2 items-center">
            <Link to="/admin/walk-in">
              <Button size="sm">Walk-in registration</Button>
            </Link>
            <Link to="/admin/create-cv">
              <Button size="sm" variant="outline">
                Create CV
              </Button>
            </Link>
            <Link to="/admin/candidates">
              <Button size="sm" variant="outline">
                All candidates
              </Button>
            </Link>
            <Link to="/admin/businesses">
              <Button size="sm" variant="outline">
                Business requests
              </Button>
            </Link>
            <span className="text-xs text-slate-400 self-center inline-flex items-center gap-1 ml-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Agency-led matching
            </span>
          </div>
        </>
      )}
    </div>
  );
}
