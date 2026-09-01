import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT } from '../lib/config';
import { Seo } from '../components/Seo';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-[70vh] bg-[#F7F9FC]">
      <Seo
        title="About | Career Job Solution"
        description="Career Job Solution is a recruitment agency in Pokhara connecting people with real jobs."
      />
      <div className="cj-container max-w-3xl py-10 md:py-14">
        <p className="cj-eyebrow mb-2">About us</p>
        <h1 className="cj-display text-2xl md:text-3xl mb-4">Career Job Solution</h1>
        <div className="space-y-4 text-[#3D4A5C] leading-relaxed mb-10">
          <p>
            We are a recruitment and placement agency based in Srijana Chowk, Pokhara. We help job seekers find
            verified openings and help businesses hire reliable staff — with human screening, not just a job board.
          </p>
          <p>
            Candidates can browse and apply without creating an account. Our team reviews applications and coordinates
            the next steps with employers.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          {[
            { t: 'Pokhara-focused', d: 'Local roles and local support.' },
            { t: 'Agency-reviewed', d: 'Applications screened by people.' },
            { t: 'Clear process', d: 'From apply to interview coordination.' },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-[#E8ECF1] bg-white p-4 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
              <h2 className="font-semibold text-[#0B1220] text-sm mb-1">{x.t}</h2>
              <p className="text-sm text-[#6B7789] leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-[#0066FF] text-white font-semibold text-sm hover:bg-[#0052CC]"
          >
            Browse jobs
          </Link>
          <WhatsAppButton message="Hello CareerJob, I want to know more about Career Job Solution." />
        </div>
        <p className="text-xs text-[#98A2B3] mt-6">{CONTACT.address}</p>
      </div>
    </div>
  );
}
