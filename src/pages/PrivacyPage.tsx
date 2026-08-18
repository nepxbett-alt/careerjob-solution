import { Link } from 'react-router-dom';
import { CONTACT, BRAND } from '../lib/config';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-sm">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-600 mb-6">Last updated: August 2026 · {BRAND.name}</p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Who we are</h2>
      <p className="text-gray-700 mb-4">
        CareerJob Solution is a recruitment agency based in Pokhara, Nepal. We process personal data
        to help candidates find jobs and businesses hire staff.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Data we collect</h2>
      <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-4">
        <li>Account details (name, email, phone)</li>
        <li>Profile information (location, skills, education, experience)</li>
        <li>Documents you upload (CV, certificates)</li>
        <li>Applications and recruitment status history</li>
        <li>Business hiring requests and contact details</li>
      </ul>

      <h2 className="font-semibold text-lg mt-6 mb-2">How we use data</h2>
      <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-4">
        <li>To process job applications and recruitment</li>
        <li>To contact you about interviews and placement</li>
        <li>To operate and improve the platform</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2 className="font-semibold text-lg mt-6 mb-2">Sharing</h2>
      <p className="text-gray-700 mb-4">
        We share candidate information with employers only as needed for recruitment, coordinated by CareerJob.
        We do not sell personal data. Public job listings may hide exact employer identity by design.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Storage & security</h2>
      <p className="text-gray-700 mb-4">
        Data is stored with our cloud providers (including Supabase). CVs are stored in private storage
        and accessed only by you and authorized CareerJob staff.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Your rights</h2>
      <p className="text-gray-700 mb-4">
        You may request access, correction, or deletion of your data by contacting us.
        Some records may be retained for legitimate recruitment and legal reasons.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Contact</h2>
      <p className="text-gray-700">
        {CONTACT.email}<br />
        {CONTACT.phones.join(' / ')}<br />
        {CONTACT.address}
      </p>

      <p className="mt-8">
        <Link to="/" className="text-[#0066FF]">← Home</Link>
      </p>
    </div>
  );
}
