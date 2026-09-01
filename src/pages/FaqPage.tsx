import { WhatsAppButton } from '../components/WhatsAppButton';
import { Seo } from '../components/Seo';

const FAQS = [
  {
    q: 'Is CareerJob a job portal like other websites?',
    a: 'We are a recruitment agency platform. Candidates apply through us. Businesses request staff through us. CareerJob reviews and coordinates the process.',
  },
  {
    q: 'Do you guarantee a job?',
    a: 'No. We help you apply and get considered, but hiring decisions belong to the employer. We never promise guaranteed employment.',
  },
  {
    q: 'Do I pay to apply?',
    a: 'No candidate application fee is charged through this platform for standard applications.',
  },
  {
    q: 'Will the employer see my phone number?',
    a: 'Employer contact is coordinated by CareerJob. Public job listings do not show private employer numbers, and we do not freely share your private details without the recruitment process.',
  },
  {
    q: 'I am an employer. How do I hire through CareerJob?',
    a: 'Contact CareerJob by phone, WhatsApp, or visit our office. Our staff manage hiring — there is no public employer self-service portal.',
  },
  {
    q: 'Where is your office?',
    a: 'Srijana Chowk, Pokhara, Nepal. You can also reach us on WhatsApp or phone.',
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-[70vh] bg-[#F7F9FC]">
      <Seo title="FAQ | Career Job Solution" description="Frequently asked questions about Career Job Solution." />
      <div className="cj-container max-w-3xl py-10 md:py-14">
        <p className="cj-eyebrow mb-2">Help</p>
        <h1 className="cj-display text-2xl md:text-3xl mb-8">FAQ</h1>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-[#E8ECF1] bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(11,18,32,0.04)]"
            >
              <h2 className="font-semibold text-[#0B1220] mb-1.5">{f.q}</h2>
              <p className="text-sm text-[#6B7789] leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-[#E8ECF1] bg-white p-5 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
          <p className="text-sm text-[#6B7789] mb-3">Still have a question?</p>
          <WhatsAppButton message="Hello CareerJob, I have a question." />
        </div>
      </div>
    </div>
  );
}
