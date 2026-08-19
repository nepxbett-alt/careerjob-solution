import { CONTACT, BRAND } from '../../lib/config';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  const { profile, user } = useAuth();

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Agency configuration and your staff account</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Agency</h2>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Name</dt><dd className="font-medium text-right">{BRAND.name}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Tagline</dt><dd className="text-right text-slate-700 max-w-[60%]">{BRAND.tagline}</dd></div>
        </dl>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Public contact</h2>
        <dl className="text-sm space-y-2 text-slate-700">
          <div className="flex justify-between gap-4"><dt className="text-slate-500">WhatsApp</dt><dd>{CONTACT.whatsapp}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Phones</dt><dd className="text-right">{CONTACT.phones.join(', ')}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="text-right break-all">{CONTACT.email}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Address</dt><dd className="text-right max-w-[60%]">{CONTACT.address}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Hours</dt><dd className="text-right">{CONTACT.officeHours}</dd></div>
        </dl>
        <p className="text-xs text-slate-400 mt-4">
          Values live in <code className="text-[11px] bg-slate-50 px-1 rounded">src/lib/config.ts</code> and can also be mirrored in agency_settings.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Your account</h2>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Name</dt><dd>{profile?.full_name || '—'}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="break-all">{user?.email || profile?.email}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Role</dt><dd className="capitalize font-medium">{profile?.role}</dd></div>
        </dl>
        <p className="text-xs text-slate-400 mt-4">
          Promote staff with SQL: <code className="text-[11px] bg-slate-50 px-1 rounded">UPDATE profiles SET role = &apos;owner&apos; WHERE email = &apos;…&apos;</code>
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-2">Operations shortcuts</h2>
        <ul className="text-sm space-y-1.5">
          <li><Link className="text-[#0066FF] font-medium" to="/admin/applications?status=applied">New applications</Link></li>
          <li><Link className="text-[#0066FF] font-medium" to="/admin/businesses">Pending hiring requests</Link></li>
          <li><Link className="text-[#0066FF] font-medium" to="/admin/interviews">Schedule interviews</Link></li>
          <li><Link className="text-[#0066FF] font-medium" to="/admin/placements">Record placements</Link></li>
        </ul>
      </section>
    </div>
  );
}
