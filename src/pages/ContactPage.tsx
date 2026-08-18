import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT } from '../lib/config';
import { Button } from '../components/ui/Button';

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Contact CareerJob</h1>
      <p className="text-gray-600 mb-10">We are here to help candidates and businesses in Pokhara and across Nepal.</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 font-semibold mb-2"><Phone className="w-5 h-5 text-[#0066FF]" /> Phone</div>
          {CONTACT.phones.map((p) => (
            <a key={p} href={`tel:${p}`} className="block text-gray-700 hover:text-[#0066FF] py-0.5">{p}</a>
          ))}
        </div>
        <div className="p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 font-semibold mb-2"><Mail className="w-5 h-5 text-[#0066FF]" /> Email</div>
          <a href={`mailto:${CONTACT.email}`} className="text-gray-700 hover:text-[#0066FF]">{CONTACT.email}</a>
        </div>
        <div className="p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 font-semibold mb-2"><MapPin className="w-5 h-5 text-[#0066FF]" /> Office</div>
          <p className="text-gray-700">{CONTACT.address}</p>
          <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0066FF] mt-1 inline-block">Get directions</a>
        </div>
        <div className="p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 font-semibold mb-2"><Clock className="w-5 h-5 text-[#0066FF]" /> Hours</div>
          <p className="text-gray-700">{CONTACT.officeHours}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <WhatsAppButton label="WhatsApp CareerJob" message="Hello CareerJob, I have a question." />
        <a href={`tel:${CONTACT.primaryPhone}`}>
          <Button variant="outline" size="lg">Call Now</Button>
        </a>
      </div>
    </div>
  );
}
