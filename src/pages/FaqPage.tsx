import { WhatsAppButton } from '../components/WhatsAppButton';

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
    q: 'I am a business. How do I hire?',
    a: 'Register as Business, submit a hiring request, and our team will review it, recruit, and coordinate interviews.',
  },
  {
    q: 'Where is your office?',
    a: 'Srijana Chowk, Pokhara, Nepal. You can also reach us on WhatsApp or phone.',
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">FAQ</h1>
      <div className="space-y-4">
        {FAQS.map((f) => (
          <div key={f.q} className="border rounded-xl p-4 bg-white">
            <h2 className="font-semibold mb-1">{f.q}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <p className="text-sm text-gray-500 mb-3">Still have a question?</p>
        <WhatsAppButton message="Hello CareerJob, I have a question." />
      </div>
    </div>
  );
}
