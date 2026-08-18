import { CONTACT, BRAND } from '../../lib/config';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsPage() {
  const { profile } = useAuth();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold mb-6">Settings</h1>

      <section className="bg-white border rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-2">Agency</h2>
        <p className="text-sm text-gray-700">{BRAND.name}</p>
        <p className="text-sm text-gray-500">{BRAND.tagline}</p>
      </section>

      <section className="bg-white border rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-2">Public contact</h2>
        <dl className="text-sm space-y-1 text-gray-700">
          <div><span className="text-gray-500">WhatsApp:</span> {CONTACT.whatsapp}</div>
          <div><span className="text-gray-500">Phones:</span> {CONTACT.phones.join(', ')}</div>
          <div><span className="text-gray-500">Email:</span> {CONTACT.email}</div>
          <div><span className="text-gray-500">Address:</span> {CONTACT.address}</div>
          <div><span className="text-gray-500">Hours:</span> {CONTACT.officeHours}</div>
        </dl>
        <p className="text-xs text-gray-400 mt-3">
          Values are configured in code (`src/lib/config.ts`) and agency_settings table.
        </p>
      </section>

      <section className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-2">Your account</h2>
        <p className="text-sm text-gray-700">{profile?.full_name || profile?.email}</p>
        <p className="text-sm text-gray-500 capitalize">Role: {profile?.role}</p>
      </section>
    </div>
  );
}
