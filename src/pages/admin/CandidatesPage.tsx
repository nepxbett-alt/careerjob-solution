import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Search, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

type SourceFilter = 'all' | 'public_application' | 'walk_in' | 'online' | 'account' | 'manual' | 'referral' | 'other';

interface CandidateRow {
  id: string;
  full_name: string;
  phone: string;
  location: string | null;
  profile_completion: number;
  cv_url: string | null;
  is_verified: boolean;
  created_at: string;
  email: string | null;
  skills: string[] | null;
  desired_position?: string | null;
  seeker_status?: string | null;
  registration_source?: string | null;
}

const SOURCE_LABELS: Record<string, { label: string; className: string }> = {
  public_application: { label: 'Public apply', className: 'bg-blue-50 text-blue-700 border-blue-100' },
  walk_in: { label: 'Walk-in', className: 'bg-amber-50 text-amber-800 border-amber-100' },
  online: { label: 'Online', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  account: { label: 'Account', className: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  manual: { label: 'Manual', className: 'bg-violet-50 text-violet-700 border-violet-100' },
  referral: { label: 'Referral', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  other: { label: 'Other', className: 'bg-slate-50 text-slate-600 border-slate-200' },
};

function SourceBadge({ source }: { source?: string | null }) {
  const key = source || 'online';
  const meta = SOURCE_LABELS[key] || SOURCE_LABELS.other;
  return (
    <span className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded border ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export default function CandidatesPage() {
  const [list, setList] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [onlyCv, setOnlyCv] = useState(false);
  const [source, setSource] = useState<SourceFilter>('all');

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from('candidate_profiles')
      .select(
        'id, full_name, phone, location, profile_completion, cv_url, is_verified, created_at, email, skills, desired_position, seeker_status, registration_source'
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (q.trim()) {
      query = query.or(
        `full_name.ilike.%${q.trim()}%,phone.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`
      );
    }
    if (source !== 'all') {
      query = query.eq('registration_source', source);
    }

    const { data, error } = await query;
    if (!error) {
      let rows = (data || []) as CandidateRow[];
      if (onlyCv) rows = rows.filter((c) => !!c.cv_url);
      setList(rows);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [onlyCv, source]);

  const filters: { value: SourceFilter; label: string }[] = [
    { value: 'all', label: 'All sources' },
    { value: 'public_application', label: 'Public apply' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'online', label: 'Online' },
    { value: 'account', label: 'Account' },
    { value: 'manual', label: 'Manual' },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Unified list — public applications, walk-ins, and accounts
          </p>
        </div>
        <Link to="/admin/walk-in">
          <Button size="sm">+ Add walk-in</Button>
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex flex-col sm:flex-row gap-2 mb-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, or email"
            className="cj-input pl-10"
          />
        </div>
        <Button type="submit" size="md">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setSource(f.value)}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors min-h-[36px] ${
              source === f.value
                ? 'bg-[#0066FF] text-white border-[#0066FF]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-600 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={onlyCv}
          onChange={(e) => setOnlyCv(e.target.checked)}
          className="rounded border-slate-300"
        />
        Only with CV uploaded
      </label>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {!loading && list.length === 0 && (
        <EmptyState
          title="No candidates found"
          description="Try another search or source filter, or add a walk-in."
        />
      )}

      <div className="space-y-2">
        {list.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 flex flex-wrap items-center gap-2">
                  <Link to={`/admin/candidates/${c.id}`} className="hover:text-[#0066FF]">
                    {c.full_name}
                  </Link>
                  <SourceBadge source={c.registration_source} />
                  {c.is_verified && (
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-600 mt-0.5">
                  {c.desired_position ? (
                    <span className="font-medium text-slate-800">{c.desired_position}</span>
                  ) : null}
                  {c.desired_position && (c.location || c.email) ? ' · ' : null}
                  {c.location || '—'}
                  {c.email ? ` · ${c.email}` : ''}
                </div>
                <div className="text-xs text-slate-400 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  <span>Profile {c.profile_completion}%</span>
                  <span className={c.cv_url ? 'text-emerald-600 font-medium' : ''}>
                    {c.cv_url ? 'CV on file' : 'No CV'}
                  </span>
                  {c.seeker_status && <span className="capitalize">{c.seeker_status}</span>}
                  <span>Joined {new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                {c.skills && c.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.skills.slice(0, 6).map((s) => (
                      <span key={s} className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 h-fit">
                <Link to={`/admin/candidates/${c.id}`}>
                  <Button size="sm">Open</Button>
                </Link>
                {c.phone && (
                  <a href={`tel:${c.phone}`}>
                    <Button size="sm" variant="outline">
                      <Phone className="w-3.5 h-3.5" aria-hidden /> {c.phone}
                    </Button>
                  </a>
                )}
                {c.cv_url && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 px-2">
                    <FileText className="w-3.5 h-3.5" aria-hidden /> CV private
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0066FF] rounded-full transition-all"
                style={{ width: `${Math.min(100, c.profile_completion || 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
