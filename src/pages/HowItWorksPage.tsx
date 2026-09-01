import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { Seo } from '../components/Seo';

const SEEKER = [
  { t: 'Find a job', d: 'Search by title, skill or Pokhara area (Lakeside, New Road, and more).' },
  { t: 'Apply online', d: 'Submit a simple form — no account required.' },
  { t: 'Create a CV (optional)', d: 'Build a professional profile so CareerJob can match you faster.' },
  { t: 'CareerJob reviews', d: 'Our team reviews every application. We do not auto-reject.' },
  { t: 'Get contacted', d: 'If shortlisted, we contact you for the next step.' },
  { t: 'Interview & placement', d: 'We coordinate interviews and support joining.' },
];

const EMPLOYER = [
  { t: 'Contact CareerJob', d: 'Call, WhatsApp, or visit our office — there is no public employer signup.' },
  { t: 'Share the role', d: 'Tell us position, salary, location and requirements.' },
  { t: 'We recruit', d: 'Our staff publish the vacancy and screen candidates.' },
  { t: 'You interview', d: 'We coordinate shortlists and interviews with your team.' },
  { t: 'Hire with support', d: 'We help complete placement paperwork.' },
];

function StepList({
  steps,
  tone,
}: {
  steps: { t: string; d: string }[];
  tone: 'blue' | 'ink';
}) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li
          key={s.t}
          className="flex gap-3.5 p-4 rounded-2xl border border-[#E8ECF1] bg-white shadow-[0_1px_2px_rgba(11,18,32,0.04)]"
        >
          <span
            className={`w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0 ${
              tone === 'blue' ? 'bg-[#0066FF]' : 'bg-[#0B1220]'
            }`}
          >
            {i + 1}
          </span>
          <div>
            <div className="font-semibold text-[#0B1220]">{s.t}</div>
            <div className="text-sm text-[#3D4A5C] mt-0.5 leading-relaxed">{s.d}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-[70vh] bg-[#F7F9FC]">
      <Seo
        title="How it works | Career Job Solution"
        description="How CareerJob helps job seekers in Pokhara find work and how employers hire through our agency."
      />
      <div className="cj-container max-w-3xl py-10 md:py-14">
        <p className="cj-eyebrow mb-2">Process</p>
        <h1 className="cj-display text-2xl md:text-3xl mb-2">How it works</h1>
        <p className="text-[#3D4A5C] mb-10 leading-relaxed max-w-xl">
          Career Job Solution is a recruitment agency. Candidates find jobs and apply on this website.
          Employers work with our staff — there is no public employer self-service portal.
        </p>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-[#0B1220] mb-4">For job seekers</h2>
          <StepList steps={SEEKER} tone="blue" />
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/jobs">
              <Button>Browse jobs</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Create profile</Button>
            </Link>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-[#0B1220] mb-4">For employers</h2>
          <StepList steps={EMPLOYER} tone="ink" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact">
              <Button>Contact CareerJob</Button>
            </Link>
            <WhatsAppButton message="Hello CareerJob, I need help hiring staff." label="Talk on WhatsApp" />
          </div>
        </section>

        <p className="text-sm text-[#6B7789] border-t border-[#E8ECF1] pt-6 leading-relaxed">
          We do not guarantee employment or salary. Final hiring decisions are made by the employer with CareerJob
          support.
        </p>
      </div>
    </div>
  );
}
