import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, ArrowRight, Shield, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { BRAND, LOCATIONS, CONTACT } from '../lib/config';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Pokhara');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location && location !== 'All Nepal') params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#E8F1FF_0%,_transparent_55%)] pointer-events-none" />
        <div className="cj-container relative pt-12 pb-14 md:pt-20 md:pb-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 mb-5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
              Recruitment agency · Pokhara, Nepal
            </div>
            <h1 className="text-[1.85rem] sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 tracking-tight leading-[1.15] mb-4">
              Find work. Hire people.<br className="hidden sm:block" />
              <span className="text-[#0066FF]"> We handle the middle.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
              {BRAND.name} connects job seekers and local businesses — simple applications, real review, WhatsApp support.
            </p>

            <form onSubmit={handleSearch} className="mb-6" role="search">
              <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/60 text-left">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden />
                  <label htmlFor="home-search" className="sr-only">Search jobs</label>
                  <input
                    id="home-search"
                    type="search"
                    placeholder="Job title or skill"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-12 pl-11 pr-3 rounded-xl border-0 bg-transparent text-base focus:outline-none focus:ring-0"
                    autoComplete="off"
                  />
                </div>
                <label htmlFor="home-location" className="sr-only">Location</label>
                <select
                  id="home-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 px-3 rounded-xl bg-slate-50 sm:bg-transparent border-0 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/25"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <Button type="submit" size="lg" className="h-12 px-7 rounded-xl shrink-0">
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
              <Link to="/jobs" className="w-full sm:w-auto">
                <Button size="lg" fullWidth className="sm:w-auto rounded-xl min-h-[48px]">
                  <Briefcase className="w-4.5 h-4.5" aria-hidden /> Browse jobs
                </Button>
              </Link>
              <Link to="/for-businesses" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" fullWidth className="sm:w-auto rounded-xl min-h-[48px]">
                  <Users className="w-4.5 h-4.5" aria-hidden /> Hire staff
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-b border-slate-100 bg-white">
        <div className="cj-container py-5 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4 text-[#0066FF]" aria-hidden /> Agency-reviewed applications</span>
          <span className="inline-flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#0066FF]" aria-hidden /> WhatsApp {CONTACT.whatsapp}</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#0066FF]" aria-hidden /> No pay-to-apply for candidates</span>
        </div>
      </section>

      {/* How it works briefly */}
      <section className="py-14 md:py-16 bg-slate-50">
        <div className="cj-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">How it works</h2>
            <p className="text-slate-600 max-w-md mx-auto text-[0.95rem]">Clear steps. CareerJob stays involved — not a faceless job board.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#E8F1FF] text-[#0066FF] flex items-center justify-center text-sm font-bold">JS</span>
                Job seekers
              </h3>
              <ol className="space-y-3 text-sm text-slate-600">
                {['Search jobs in Pokhara & Nepal', 'Apply with a simple profile + CV', 'We review — then contact you', 'Interview & placement support'].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-[#0066FF] font-semibold w-5 shrink-0">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ol>
              <Link to="/jobs" className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-[#0066FF]">
                Find jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold">B</span>
                Businesses
              </h3>
              <ol className="space-y-3 text-sm text-slate-600">
                {['Submit a hiring request', 'We accept and publish the role', 'We screen and shortlist', 'You interview — we support joining'].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="font-semibold text-slate-800 w-5 shrink-0">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ol>
              <Link to="/for-businesses" className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-slate-800">
                Request staff <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-16 bg-[#0066FF] text-white">
        <div className="cj-container text-center max-w-lg">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Need help right now?</h2>
          <p className="text-white/90 mb-6 leading-relaxed text-[0.95rem]">
            Message CareerJob on WhatsApp — jobs, applications, or hiring questions.
          </p>
          <WhatsAppButton
            message="Hello CareerJob, I need help."
            label="Chat on WhatsApp"
            className="!bg-white !text-[#0066FF] hover:!bg-slate-100 !rounded-xl !h-12"
          />
          <p className="text-xs text-white/70 mt-4">{CONTACT.address}</p>
        </div>
      </section>
    </div>
  );
}
