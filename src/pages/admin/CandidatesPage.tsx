import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

interface CandidateRow {
  id: string;
  full_name: string;
  phone: string;
  location: string | null;
  profile_completion: number;
  cv_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export default function CandidatesPage() {
  const [list, setList] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from('candidate_profiles')
      .select('id, full_name, phone, location, profile_completion, cv_url, is_verified, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (q.trim()) {
      query = query.or(`full_name.ilike.%${q.trim()}%,phone.ilike.%${q.trim()}%`);
    }
    const { data, error } = await query;
    if (!error) setList((data || []) as CandidateRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">Candidates</h1>
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or phone"
            className="h-9 px-3 border rounded-lg text-sm"
          />
          <Button type="submit" size="sm">Search</Button>
        </form>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && list.length === 0 && <p className="text-gray-500">No candidates yet.</p>}

      <div className="space-y-2">
        {list.map((c) => (
          <div key={c.id} className="bg-white border rounded-xl p-4 flex flex-wrap justify-between gap-2">
            <div>
              <div className="font-semibold">{c.full_name}</div>
              <div className="text-sm text-gray-600">{c.phone} · {c.location || '—'}</div>
              <div className="text-xs text-gray-400 mt-1">
                Profile {c.profile_completion}% · {c.cv_url ? 'CV ✓' : 'No CV'} · Joined {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
            {c.is_verified && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded h-fit">Verified</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
