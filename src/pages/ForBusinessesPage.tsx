import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CONTACT } from '../lib/config';
import { Building2, Phone } from 'lucide-react';

/**
 * Employers do not self-serve on CareerJob.
 * Hiring is coordinated by CareerJob staff only.
 */
export default function ForBusinessesPage() {
  return (
    <div className="cj-container py-12 md:py-16 max-w-xl">
      <Seo
        title="Hire with CareerJob | Pokhara Recruitment Agency"
        description="Contact CareerJob Solution to hire staff in Pokhara. Our team manages recruitment — there is no public employer self-service portal."
        canonical="https://careerjobsolution.com.np/for-businesses"
      />
      <div className="text-center mb-8">
        <Building2 className="w-10 h-10 text-[#0066FF] mx-auto mb-3" aria-hidden />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0B1220] mb-2">
          Hiring in Pokhara?
        </h1>
        <p className="text-[#3D4A5C] leading-relaxed">
          CareerJob Solution is a recruitment agency. We manage jobs, candidates, and hiring for you.
          There is no public employer signup or self-service job board for businesses.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E8ECF1] bg-[#F7F9FC] p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold text-[#0B1220]">How to work with us</h2>
        <ol className="text-sm text-[#3D4A5C] space-y-2 list-decimal list-inside">
          <li>Contact our team (call, WhatsApp, or visit the office).</li>
          <li>Tell us the role, location, salary, and requirements.</li>
          <li>We publish the vacancy and screen candidates.</li>
          <li>You interview shortlisted people — we support the process.</li>
        </ol>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <WhatsAppButton
            message="Hello CareerJob, I am an employer and need help hiring in Pokhara."
            label="WhatsApp CareerJob"
            className="!rounded-xl !h-11"
          />
          <a href={`tel:${CONTACT.phones[0]}`}>
            <Button variant="outline" size="lg" className="rounded-xl w-full sm:w-auto">
              <Phone className="w-4 h-4" aria-hidden />
              Call {CONTACT.phones[0]}
            </Button>
          </a>
        </div>
        <p className="text-xs text-[#6B7789]">
          {CONTACT.address} · {CONTACT.officeHours}
        </p>
      </div>

      <p className="text-center text-sm text-[#6B7789] mt-8">
        Looking for a job?{' '}
        <Link to="/jobs" className="text-[#0066FF] font-semibold">
          Browse Pokhara jobs
        </Link>
      </p>
    </div>
  );
}
