import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT } from '../lib/config';
import { Seo } from '../components/Seo';

const STEPS = [
  { n: '1', t: 'Submit a hiring request', d: 'Role, headcount, location, salary range and requirements.' },
  { n: '2', t: 'We review & accept', d: 'Suitable requests become published jobs on the platform.' },
  { n: '3', t: 'We find candidates', d: 'Applications are screened by our team — not left on autopilot.' },
  { n: '4', t: 'Interview & select', d: 'We coordinate. You choose who joins.' },
  { n: '5', t: 'Placement support', d: 'Documentation and joining support when needed.' },
];

export default function ForBusinessesPage() {
  return (
    <div className="min-h-[70vh] bg-[#F7F9FC]">
      <Seo
        title="For businesses | CareerJob Solution"
        description="Hire reliable staff in Pokhara. CareerJob recruits, screens, and coordinates interviews."
      />
      <div className="cj-container max-w-3xl py-10 md:py-14">
        <p className="cj-eyebrow mb-2">For employers</p>
        <h1 className="cj-display text-2xl md:text-3xl mb-3">Need reliable staff?</h1>
        <p className="text-lg text-[#3D4A5C] mb-10 leading-relaxed max-w-xl">
          Tell CareerJob what you need. We recruit, screen, and coordinate interviews — you decide who to hire.
        </p>

        <div className="space-y-3 mb-10">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="flex gap-4 p-4 sm:p-5 rounded-2xl border border-[#E8ECF1] bg-white shadow-[0_1px_2px_rgba(11,18,32,0.04)]"
            >
              <div className="w-9 h-9 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-sm font-bold shrink-0">
                {s.n}
              </div>
              <div>
                <h2 className="font-semibold text-[#0B1220]">{s.t}</h2>
                <p className="text-sm text-[#6B7789] mt-0.5 leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Link to="/register">
            <Button size="lg">Register as business</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Already registered? Log in
            </Button>
          </Link>
        </div>
        <WhatsAppButton message="Hello CareerJob, I need help hiring staff." label="Talk on WhatsApp" />
        <p className="text-xs text-[#98A2B3] mt-6">Or call {CONTACT.phones.join(' / ')}</p>
      </div>
    </div>
  );
}
