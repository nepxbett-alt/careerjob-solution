import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { submitHiringRequest } from '../../services/businessService';
import { Button } from '../../components/ui/Button';
import { AiAssistPanel } from '../../components/AiAssistPanel';
import { LOCATIONS } from '../../lib/config';

export default function HiringRequestPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [number, setNumber] = useState(1);
  const [location, setLocation] = useState('Pokhara');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [requirements, setRequirements] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // ensure organization exists for this business user
      let orgId: string;
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership) {
        orgId = membership.organization_id;
      } else {
        const { data: org, error: orgErr } = await supabase
          .from('organizations')
          .insert({
            name: contactPerson || user.email || 'Business',
            type: 'business',
            contact_person: contactPerson,
            phone: contactPhone,
            location,
            status: 'pending',
            created_by: user.id,
          })
          .select()
          .single();
        if (orgErr) throw orgErr;
        orgId = org.id;
        await supabase.from('organization_members').insert({
          organization_id: orgId,
          user_id: user.id,
          role: 'owner',
        });
      }

      await submitHiringRequest({
        organization_id: orgId,
        position_title: title,
        number_required: number,
        location,
        salary_min: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salary_max: salaryMax ? parseInt(salaryMax, 10) : undefined,
        additional_requirements: requirements,
        contact_person: contactPerson,
        contact_phone: contactPhone,
        created_by: user.id,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 text-center max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-2">Request received</h1>
        <p className="text-gray-600">
          Your hiring requirement has been received. Our CareerJob team will review it and contact you.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Hiring Request</h1>
      <form className="space-y-4 bg-white border rounded-xl p-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Position title *</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-11 px-3 border rounded-lg" placeholder="e.g. Waiter" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number required *</label>
          <input type="number" min={1} required value={number} onChange={(e) => setNumber(parseInt(e.target.value, 10) || 1)} className="w-full h-11 px-3 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location *</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-11 px-3 border rounded-lg bg-white">
            {LOCATIONS.filter((l) => l !== 'All Pokhara').map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Salary min (NPR)</label>
            <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className="w-full h-11 px-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salary max (NPR)</label>
            <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className="w-full h-11 px-3 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Requirements</label>
          <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} className="w-full h-24 px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact person</label>
          <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full h-11 px-3 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact phone</label>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full h-11 px-3 border rounded-lg" placeholder="98XXXXXXXX" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">AI assist</p>
          <AiAssistPanel
            task="job_description"
            label="Improve description"
            buildInput={() =>
              [title && `Position: ${title}`, location && `Location: ${location}`, requirements && `Notes: ${requirements}`]
                .filter(Boolean)
                .join('\n')
            }
            onAccept={(result) => setRequirements(result)}
          />
          <AiAssistPanel
            task="job_requirements"
            label="Generate requirements"
            buildInput={() =>
              [title && `Position: ${title}`, requirements && `Context: ${requirements}`].filter(Boolean).join('\n')
            }
            onAccept={(result) => setRequirements((prev) => (prev ? prev + '\n\n' + result : result))}
          />
        </div>
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Hiring Request'}
        </Button>
      </form>
    </div>
  );
}
