import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
export default function SavedJobsPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Saved Jobs</h1>
      <p className="text-gray-600 mb-6">You haven&apos;t saved any jobs.</p>
      <Link to="/jobs"><Button>Browse Jobs</Button></Link>
    </div>
  );
}
