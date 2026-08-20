import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">How it works</h1>
      <p className="text-gray-600 mb-10">
        CareerJob Solution is a recruitment agency platform. We connect job seekers with opportunities and help businesses hire — we stay involved at every step.
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">For job seekers</h2>
        <ol className="space-y-4">
          {[
            { t: 'Find a job', d: 'Search by title, skill or Pokhara area (Lakeside, New Road, and more).' },
            { t: 'Apply online', d: 'Complete a simple profile and apply in under a minute.' },
            { t: 'CareerJob reviews', d: 'Our team reviews every application. We do not auto-reject.' },
            { t: 'Get contacted', d: 'If shortlisted, we contact you for the next step.' },
            { t: 'Interview', d: 'We coordinate the interview with the employer.' },
            { t: 'Get placed', d: 'After selection we complete placement support.' },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-[#0066FF] text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div>
                <div className="font-medium">{s.t}</div>
                <div className="text-sm text-gray-600">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <Link to="/jobs"><Button>Browse jobs</Button></Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">For businesses</h2>
        <ol className="space-y-4">
          {[
            { t: 'Submit a hiring request', d: 'Tell us the role, number of people, location and requirements.' },
            { t: 'We review', d: 'CareerJob accepts suitable requests and creates the job listing.' },
            { t: 'We recruit', d: 'Candidates apply; we screen and shortlist.' },
            { t: 'Interview & select', d: 'We coordinate interviews. You choose who to hire.' },
            { t: 'Placement', d: 'We support documentation and joining.' },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-gray-800 text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div>
                <div className="font-medium">{s.t}</div>
                <div className="text-sm text-gray-600">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/for-businesses"><Button>Hire staff</Button></Link>
          <WhatsAppButton message="Hello CareerJob, I need help hiring staff." label="Talk on WhatsApp" />
        </div>
      </section>

      <p className="text-sm text-gray-500 border-t pt-6">
        We do not guarantee employment or salary. Final hiring decisions are made by the employer with CareerJob support.
      </p>
    </div>
  );
}
