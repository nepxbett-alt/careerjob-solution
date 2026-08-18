import { useState } from 'react';
import { Button } from '../../components/ui/Button';
export default function HiringRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-xl font-bold mb-2">Request received</h1>
        <p className="text-gray-600">Our CareerJob team will review it and contact you.</p>
      </div>
    );
  }
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Hiring Request</h1>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
        <input required placeholder="Position title" className="w-full h-11 px-3 border rounded-lg" />
        <input type="number" min={1} defaultValue={1} placeholder="Number required" className="w-full h-11 px-3 border rounded-lg" />
        <input required placeholder="Location (e.g. Pokhara)" className="w-full h-11 px-3 border rounded-lg" />
        <textarea placeholder="Requirements / notes" className="w-full h-24 px-3 py-2 border rounded-lg" />
        <Button type="submit" fullWidth size="lg">Submit Hiring Request</Button>
      </form>
    </div>
  );
}
