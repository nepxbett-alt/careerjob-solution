import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
export default function ApplicationsPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Applications</h1>
      <p className="text-gray-600 mb-6">You haven&apos;t applied for any jobs yet.</p>
      <Link to="/jobs"><Button>Explore Jobs</Button></Link>
    </div>
  );
}
