import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CONTACT } from '../../lib/config';
import { WhatsAppButton } from '../../components/WhatsAppButton';

/** Legacy business accounts: no self-service portal — contact CareerJob staff. */
export default function BusinessHome() {
  return (
    <div className="max-w-lg mx-auto py-10 px-4 text-center space-y-4">
      <h1 className="text-xl font-bold text-[#0B1220]">Employer access</h1>
      <p className="text-sm text-[#3D4A5C] leading-relaxed">
        CareerJob no longer offers a public employer dashboard. Hiring is managed by our staff.
        Please contact the agency for vacancies, candidates, and interviews.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <WhatsAppButton
          message="Hello CareerJob, I am an employer and need assistance."
          label="WhatsApp CareerJob"
        />
        <a href={`tel:${CONTACT.phones[0]}`}>
          <Button variant="outline">Call {CONTACT.phones[0]}</Button>
        </a>
      </div>
      <Link to="/jobs" className="block text-sm text-[#0066FF] font-medium pt-2">
        Browse public jobs
      </Link>
    </div>
  );
}
