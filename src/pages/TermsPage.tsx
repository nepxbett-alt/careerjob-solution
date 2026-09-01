import { Link } from 'react-router-dom';
import { CONTACT, BRAND } from '../lib/config';

export default function TermsPage() {
  return (
    <div className="cj-container max-w-3xl py-10 md:py-14">
      <h1 className="text-2xl font-bold mb-4">Terms of Use</h1>
      <p className="text-slate-600 mb-6">Last updated: August 2026 · {BRAND.name}</p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Service</h2>
      <p className="text-slate-700 mb-4">
        Career Job Solution provides a digital recruitment service operated by our agency.
        We connect job seekers with opportunities and help businesses hire. We are not a
        freelancer marketplace and do not guarantee employment or any specific salary.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Candidates</h2>
      <ul className="list-disc pl-5 text-slate-700 space-y-1 mb-4">
        <li>Provide accurate profile and document information</li>
        <li>Applications are reviewed by CareerJob; status updates are decided by our team and employers</li>
        <li>You must not create multiple accounts to abuse the system</li>
      </ul>

      <h2 className="font-semibold text-lg mt-6 mb-2">Businesses</h2>
      <ul className="list-disc pl-5 text-slate-700 space-y-1 mb-4">
        <li>Hiring requests are subject to CareerJob review and acceptance</li>
        <li>Jobs are published only after agency approval</li>
        <li>You remain responsible for lawful hiring decisions</li>
      </ul>

      <h2 className="font-semibold text-lg mt-6 mb-2">Acceptable use</h2>
      <p className="text-slate-700 mb-4">
        Do not use the platform for fraud, harassment, illegal activity, or uploading malware.
        We may suspend accounts that violate these terms.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Limitation</h2>
      <p className="text-slate-700 mb-4">
        The platform is provided as a recruitment support tool. We are not liable for employment
        outcomes, employer decisions, or third-party actions beyond our reasonable control.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Contact</h2>
      <p className="text-slate-700">
        {CONTACT.email} · {CONTACT.phones.join(' / ')} · {CONTACT.address}
      </p>

      <p className="mt-8">
        <Link to="/" className="text-[#0066FF]">← Home</Link>
      </p>
    </div>
  );
}
