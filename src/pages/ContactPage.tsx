import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT } from '../lib/config';
import { Button } from '../components/ui/Button';

export default function ContactPage() {
  return (
    <div className="cj-container max-w-3xl cj-page">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">Contact</h1>
      <p className="text-slate-600 mb-8 max-w-lg leading-relaxed">
        CareerJob Solution — Pokhara. Call, WhatsApp, or email. We help job seekers and businesses.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {[
          {
            icon: Phone,
            title: 'Phone',
            body: (
              <div className="space-y-1">
                {CONTACT.phones.map((p) => (
                  <a key={p} href={`tel:${p}`} className="block text-slate-800 hover:text-[#0066FF] font-medium">{p}</a>
                ))}
              </div>
            ),
          },
          {
            icon: Mail,
            title: 'Email',
            body: (
              <a href={`mailto:${CONTACT.email}`} className="text-slate-800 hover:text-[#0066FF] font-medium break-all">
                {CONTACT.email}
              </a>
            ),
          },
          {
            icon: MapPin,
            title: 'Office',
            body: (
              <>
                <p className="text-slate-800">{CONTACT.address}</p>
                <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0066FF] font-medium mt-1 inline-block">
                  Open in Maps
                </a>
              </>
            ),
          },
          {
            icon: Clock,
            title: 'Hours',
            body: <p className="text-slate-800">{CONTACT.officeHours}</p>,
          },
        ].map((card) => (
          <div key={card.title} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <card.icon className="w-5 h-5 text-[#0066FF]" aria-hidden />
              {card.title}
            </div>
            {card.body}
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <div className="rounded-2xl border border-slate-200 bg-slate-100 h-48 mb-8 flex items-center justify-center text-sm text-slate-500">
        <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[#0066FF] font-medium hover:underline">
          Srijana Chowk, Pokhara — view on Google Maps
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <WhatsAppButton label="WhatsApp CareerJob" message="Hello CareerJob, I have a question." />
        <a href={`tel:${CONTACT.primaryPhone}`}>
          <Button variant="outline" size="lg">Call {CONTACT.primaryPhone}</Button>
        </a>
      </div>
    </div>
  );
}
