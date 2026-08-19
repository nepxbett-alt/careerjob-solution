import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT } from '../lib/config';

export default function ForBusinessesPage() {
  return (
    <div className="cj-container max-w-3xl cj-page">
      <p className="text-sm font-medium text-[#0066FF] mb-2">For employers</p>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-3">Need reliable staff?</h1>
      <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
        Tell CareerJob what you need. We recruit, screen, and coordinate interviews — you decide who to hire.
      </p>

      <div className="space-y-3 mb-10">
        {[
          { n: '1', t: 'Submit a hiring request', d: 'Role, headcount, location, salary range and requirements.' },
          { n: '2', t: 'We review & accept', d: 'Suitable requests become published jobs on the platform.' },
          { n: '3', t: 'We find candidates', d: 'Applications are screened by our team — not left on autopilot.' },
          { n: '4', t: 'Interview & select', d: 'We coordinate. You choose who joins.' },
          { n: '5', t: 'Placement support', d: 'Documentation and joining support when needed.' },
        ].map((s) => (
          <div key={s.n} className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-white">
            <div className="w-9 h-9 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-sm font-bold shrink-0">
              {s.n}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{s.t}</h3>
              <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Link to="/register">
          <Button size="lg">Register as business</Button>
        </Link>
        <Link to="/login">
          <Button size="lg" variant="outline">Already registered? Log in</Button>
        </Link>
      </div>
      <WhatsAppButton message="Hello CareerJob, I need help hiring staff." label="Talk on WhatsApp" />
      <p className="text-xs text-slate-400 mt-6">Or call {CONTACT.phones.join(' / ')}</p>
    </div>
  );
}
