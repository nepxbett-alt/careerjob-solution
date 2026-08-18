import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-[#0066FF] mb-2">404</p>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Page not found</h1>
      <p className="text-slate-600 mb-8 max-w-sm">
        That link doesn&apos;t match any page. Try searching jobs or go back home.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/"><Button variant="outline">Go home</Button></Link>
        <Link to="/jobs"><Button>Search jobs</Button></Link>
      </div>
    </div>
  );
}
