import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';

export default function ForBusinessesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Need staff?</h1>
      <p className="text-lg text-gray-600 mb-8">Tell CareerJob what you need. We handle recruitment.</p>

      <div className="space-y-6 mb-10">
        {[
          { n: '1', t: 'Submit hiring requirement', d: 'Position, number of people, location, salary range and requirements.' },
          { n: '2', t: 'CareerJob reviews', d: 'Our team reviews your request and accepts suitable ones.' },
          { n: '3', t: 'We find candidates', d: 'We recruit, screen and shortlist suitable people.' },
          { n: '4', t: 'Interview & select', d: 'We coordinate interviews. You select.' },
          { n: '5', t: 'Placement', d: 'We complete documentation and placement.' },
        ].map((s) => (
          <div key={s.n} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-sm font-bold shrink-0">{s.n}</div>
            <div>
              <h3 className="font-semibold">{s.t}</h3>
              <p className="text-sm text-gray-600">{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/register"><Button size="lg">Register as Business</Button></Link>
        <WhatsAppButton message="Hello CareerJob, I need help hiring staff." label="Talk to CareerJob" />
      </div>
    </div>
  );
}
