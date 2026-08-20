import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT, BRAND } from '../lib/config';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-3">About {BRAND.name}</h1>
      <p className="text-lg text-gray-600 mb-6">
        {BRAND.tagline}
      </p>
      <p className="text-gray-700 leading-relaxed mb-4">
        CareerJob Solution is a Pokhara-focused recruitment agency based at Srijana Chowk.
        We help ordinary job seekers find work and help local businesses hire reliable staff —
        without complicated marketplaces or bidding.
      </p>
      <p className="text-gray-700 leading-relaxed mb-8">
        Candidates apply through us. Businesses tell us what they need. Our team reviews,
        shortlists, coordinates interviews and supports placement. We stay the central operator
        so the process stays simple and trustworthy.
      </p>

      <div className="bg-gray-50 rounded-xl border p-5 mb-8 text-sm">
        <div className="font-semibold mb-2">Office</div>
        <p className="text-gray-600">{CONTACT.address}</p>
        <p className="text-gray-600 mt-1">Phone: {CONTACT.phones.join(' / ')}</p>
        <p className="text-gray-600">Email: {CONTACT.email}</p>
        <p className="text-gray-600">{CONTACT.officeHours}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/jobs"><Button>Find jobs</Button></Link>
        <Link to="/contact"><Button variant="outline">Contact</Button></Link>
        <WhatsAppButton />
      </div>
    </div>
  );
}
