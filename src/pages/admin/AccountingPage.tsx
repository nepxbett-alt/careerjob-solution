import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

interface Tx {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  reference: string | null;
  created_at: string;
}

export default function AccountingPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const canEdit = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'accountant';

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('id, type, amount, currency, status, description, reference, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    setRows((data || []) as Tx[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setBusy(true);
    try {
      await supabase.from('transactions').insert({
        type,
        amount: parseFloat(amount),
        currency: 'NPR',
        status: 'received',
        description: description || null,
        created_by: profile?.id,
      });
      setShow(false);
      setAmount('');
      setDescription('');
      load();
    } catch {
      alert('Could not save transaction');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Accounting</h1>
          <p className="text-sm text-slate-500">Internal agency records only — not a candidate wallet.</p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => setShow(!show)}>{show ? 'Cancel' : 'Add record'}</Button>
        )}
      </div>

      {show && canEdit && (
        <form onSubmit={add} className="bg-white border rounded-xl p-4 mb-6 max-w-md space-y-3">
          <div>
            <label className="cj-label">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="cj-input">
              {['income', 'expense', 'commission', 'pending', 'received', 'adjustment'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="cj-label">Amount (NPR)</label>
            <input required type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="cj-input" />
          </div>
          <div>
            <label className="cj-label">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="cj-input" />
          </div>
          <Button type="submit" loading={busy}>Save</Button>
        </form>
      )}

      {loading && <p className="text-slate-500 text-sm">Loading…</p>}
      {!loading && rows.length === 0 && (
        <EmptyState title="No transactions yet" description="Record commission or expenses when placements complete." />
      )}
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="bg-white border rounded-xl p-4 flex justify-between gap-3">
            <div>
              <div className="font-medium capitalize">{r.type}</div>
              <div className="text-sm text-slate-500">{r.description || r.reference || '—'}</div>
              <div className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">NPR {Number(r.amount).toLocaleString()}</div>
              <div className="text-xs text-slate-500 capitalize">{r.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
