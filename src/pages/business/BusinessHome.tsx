import { Link } from 'react-router-dom';
import { FilePlus, List, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import { useAuth } from '../../contexts/AuthContext';
import { CONTACT } from '../../lib/config';

export default function BusinessHome() {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      <header>
        <p className="text-sm text-slate-500">Business workspace</p>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Hi, {name}</h1>
      </header>

      <div className="rounded-2xl border border-[#0066FF]/20 bg-[#E8F1FF]/50 p-4">
        <p className="font-semibold text-slate-900 text-sm mb-1">Need staff?</p>
        <p className="text-sm text-slate-600 mb-3 leading-relaxed">
          Submit a hiring request. CareerJob reviews it, recruits candidates, and coordinates interviews.
        </p>
        <Link to="/business/request">
          <Button size="sm">Request staff</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/business/request"
          className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-[#0066FF]/40 hover:shadow-sm transition-all min-h-[88px]"
        >
          <FilePlus className="w-5 h-5 text-[#0066FF] mb-2" aria-hidden />
          <div className="font-semibold text-sm text-slate-900">New request</div>
          <div className="text-xs text-slate-500 mt-0.5">Role & headcount</div>
        </Link>
        <Link
          to="/business/requests"
          className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-[#0066FF]/40 hover:shadow-sm transition-all min-h-[88px]"
        >
          <List className="w-5 h-5 text-[#0066FF] mb-2" aria-hidden />
          <div className="font-semibold text-sm text-slate-900">My requests</div>
          <div className="text-xs text-slate-500 mt-0.5">Status tracking</div>
        </Link>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-4">
        <h2 className="font-semibold text-slate-900 text-sm mb-2">How CareerJob helps</h2>
        <ol className="text-sm text-slate-600 space-y-2">
          <li className="flex gap-2"><span className="text-[#0066FF] font-semibold">1.</span> You submit requirements</li>
          <li className="flex gap-2"><span className="text-[#0066FF] font-semibold">2.</span> We accept and publish the role</li>
          <li className="flex gap-2"><span className="text-[#0066FF] font-semibold">3.</span> We screen applicants</li>
          <li className="flex gap-2"><span className="text-[#0066FF] font-semibold">4.</span> You interview and select</li>
        </ol>
        <Link to="/how-it-works" className="inline-flex items-center gap-1 text-sm font-medium text-[#0066FF] mt-3">
          Learn more <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      <div>
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" aria-hidden /> Prefer to talk?
        </p>
        <WhatsAppButton message="Hello CareerJob, I need help hiring staff." label="WhatsApp CareerJob" />
        <p className="text-xs text-slate-400 mt-2">Or call {CONTACT.primaryPhone}</p>
      </div>
    </div>
  );
}
