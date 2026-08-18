import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">CareerJob Solution</h1>
      <p className="text-gray-600 mb-8">This page is part of the platform. Full content is being completed.</p>
      <div className="flex gap-3 flex-wrap">
        <Link to="/"><Button variant="outline">Go Home</Button></Link>
        <Link to="/jobs"><Button>Search Jobs</Button></Link>
      </div>
      <div className="mt-8"><WhatsAppButton /></div>
    </div>
  );
}
