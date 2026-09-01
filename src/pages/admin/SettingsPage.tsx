import { useState } from 'react';
import { CONTACT, BRAND } from '../../lib/config';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  exportCandidatesCsv,
  exportJobsCsv,
  exportApplicationsCsv,
  exportPlacementsCsv,
  exportOrganizationsCsv,
  exportFullJsonBackup,
} from '../../lib/adminExport';
import { Download } from 'lucide-react';

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const [exportBusy, setExportBusy] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportErr, setExportErr] = useState<string | null>(null);

  const runExport = async (key: string, fn: () => Promise<number | Record<string, number>>) => {
    setExportBusy(key);
    setExportMsg(null);
    setExportErr(null);
    try {
      const result = await fn();
      if (typeof result === 'number') {
        setExportMsg(`Downloaded ${result} rows (${key}).`);
      } else {
        setExportMsg(
          `Full backup downloaded — candidates ${result.candidates}, jobs ${result.jobs}, applications ${result.applications}, placements ${result.placements}, organizations ${result.organizations}.`,
        );
      }
    } catch (e: unknown) {
      setExportErr(e instanceof Error ? e.message : 'Export failed. Check you are logged in as staff.');
    } finally {
      setExportBusy(null);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#0B1220]">Settings</h1>
        <p className="text-sm text-[#6B7789] mt-0.5">Agency configuration, data export, and your staff account</p>
      </div>

      <section className="bg-white border border-[#E8ECF1] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#0B1220] mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#0066FF]" aria-hidden />
          Download data
        </h2>
        <p className="text-sm text-[#6B7789] mb-4 leading-relaxed">
          Export live recruitment data anytime (CSV or full JSON backup). Staff access only — respects your login.
        </p>
        {exportMsg && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-3" role="status">
            {exportMsg}
          </p>
        )}
        {exportErr && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3" role="alert">
            {exportErr}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!!exportBusy}
            loading={exportBusy === 'candidates'}
            onClick={() => runExport('candidates', exportCandidatesCsv)}
          >
            Candidates CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!!exportBusy}
            loading={exportBusy === 'jobs'}
            onClick={() => runExport('jobs', exportJobsCsv)}
          >
            Jobs CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!!exportBusy}
            loading={exportBusy === 'applications'}
            onClick={() => runExport('applications', exportApplicationsCsv)}
          >
            Applications CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!!exportBusy}
            loading={exportBusy === 'placements'}
            onClick={() => runExport('placements', exportPlacementsCsv)}
          >
            Placements CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!!exportBusy}
            loading={exportBusy === 'organizations'}
            onClick={() => runExport('organizations', exportOrganizationsCsv)}
          >
            Organizations CSV
          </Button>
          <Button
            size="sm"
            disabled={!!exportBusy}
            loading={exportBusy === 'full'}
            onClick={() => runExport('full', exportFullJsonBackup)}
          >
            Full JSON backup
          </Button>
        </div>
      </section>

      <section className="bg-white border border-[#E8ECF1] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#0B1220] mb-3">Agency</h2>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">Name</dt>
            <dd className="font-medium text-right">{BRAND.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">Tagline</dt>
            <dd className="text-right text-[#3D4A5C] max-w-[60%]">{BRAND.tagline}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-white border border-[#E8ECF1] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#0B1220] mb-3">Public contact</h2>
        <dl className="text-sm space-y-2 text-[#3D4A5C]">
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">WhatsApp</dt>
            <dd>{CONTACT.whatsapp}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">Phones</dt>
            <dd className="text-right">{CONTACT.phones.join(', ')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">Email</dt>
            <dd className="text-right break-all">{CONTACT.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">Address</dt>
            <dd className="text-right max-w-[60%]">{CONTACT.address}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">Hours</dt>
            <dd className="text-right">{CONTACT.officeHours}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-white border border-[#E8ECF1] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#0B1220] mb-3">Your account</h2>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">Name</dt>
            <dd>{profile?.full_name || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">Email</dt>
            <dd className="break-all">{user?.email || profile?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6B7789]">Role</dt>
            <dd className="capitalize font-medium">{profile?.role}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-white border border-[#E8ECF1] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#0B1220] mb-2">Operations shortcuts</h2>
        <ul className="text-sm space-y-1.5">
          <li>
            <Link className="text-[#0066FF] font-medium" to="/admin/applications?status=applied">
              New applications
            </Link>
          </li>
          <li>
            <Link className="text-[#0066FF] font-medium" to="/admin/businesses">
              Pending hiring requests
            </Link>
          </li>
          <li>
            <Link className="text-[#0066FF] font-medium" to="/admin/interviews">
              Schedule interviews
            </Link>
          </li>
          <li>
            <Link className="text-[#0066FF] font-medium" to="/admin/placements">
              Record placements
            </Link>
          </li>
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-4">
        <h2 className="font-semibold text-slate-900 mb-2">Staff roles</h2>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
          <li><strong>Owner / Admin</strong> — full control + Settings</li>
          <li><strong>Manager</strong> — full recruitment desk (candidates, jobs, workplace, trials). Use for reception desk lead.</li>
          <li><strong>Recruiter / Staff</strong> — day-to-day matching and follow-ups</li>
          <li><strong>Viewer</strong> — read-only</li>
        </ul>
        <p className="text-xs text-slate-400 mt-3">
          Example: <code className="text-[11px] bg-slate-50 px-1 rounded">UPDATE profiles SET role = &apos;manager&apos; WHERE email = &apos;receptionist@…&apos;;</code>
        </p>
      </section>

    </div>
  );
}
