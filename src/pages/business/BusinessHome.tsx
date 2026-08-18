import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
export default function BusinessHome() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Business Home</h1>
      <p className="text-gray-600 mb-6">Need staff? Submit a hiring request and CareerJob will handle recruitment.</p>
      <Link to="/business/request"><Button size="lg">Request Staff</Button></Link>
    </div>
  );
}
