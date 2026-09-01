import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT, getWhatsAppLink } from '../lib/config';
import { Seo } from '../components/Seo';

export default function ContactPage() {
  const items = [
    {
      icon: Phone,
      title: 'Phone',
      body: (
        <div className="space-y-1">
          {CONTACT.phones.map((p) => (
            <a key={p} href={`tel:+977${p}`} className="block text-[#0066FF] font-medium hover:underline">
              {p}
            </a>
          ))}
        </div>
      ),
    },
    {
      icon: Mail,
      title: 'Email',
      body: (
        <a href={`mailto:${CONTACT.email}`} className="text-[#0066FF] font-medium hover:underline break-all">
          {CONTACT.email}
        </a>
      ),
    },
    {
      icon: MapPin,
      title: 'Office',
      body: (
        <a
          href={CONTACT.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3D4A5C] hover:text-[#0066FF]"
        >
          {CONTACT.address}
        </a>
      ),
    },
    {
      icon: Clock,
      title: 'Hours',
      body: <span className="text-[#3D4A5C]">{CONTACT.officeHours}</span>,
    },
  ];

  return (
    <div className="min-h-[70vh] bg-[#F7F9FC]">
      <Seo title="Contact | CareerJob Solution" description="Call, WhatsApp, or visit CareerJob Solution in Pokhara." />
      <div className="cj-container max-w-3xl py-10 md:py-14">
        <p className="cj-eyebrow mb-2">Get in touch</p>
        <h1 className="cj-display text-2xl md:text-3xl mb-2">Contact</h1>
        <p className="text-[#3D4A5C] mb-8 max-w-lg leading-relaxed">
          CareerJob Solution — Pokhara. Call, WhatsApp, or email. We help job seekers and businesses.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-3.5 p-4 sm:p-5 rounded-2xl border border-[#E8ECF1] bg-white shadow-[0_1px_2px_rgba(11,18,32,0.04)]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#0066FF] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#0B1220] mb-1">{title}</h2>
                <div className="text-sm leading-relaxed">{body}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#E8ECF1] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
          <h2 className="font-semibold text-[#0B1220] mb-1">Fastest response</h2>
          <p className="text-sm text-[#6B7789] mb-4 leading-relaxed">
            Message us on WhatsApp for jobs, applications, or hiring requests.
          </p>
          <WhatsAppButton label="WhatsApp CareerJob" message="Hello CareerJob, I have a question." />
          <p className="text-xs text-[#98A2B3] mt-3">
            Or open{' '}
            <a className="text-[#0066FF] hover:underline" href={getWhatsAppLink()}>
              wa.me/{CONTACT.whatsapp}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
