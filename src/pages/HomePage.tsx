import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, ArrowRight, Shield, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { BRAND, LOCATIONS } from '../lib/config';

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
      <section className="relative border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="cj-container pt-14 pb-16 md:pt-20 md:pb-24 text-center">
          <p className="text-sm font-medium text-[#0066FF] mb-3 tracking-wide">Recruitment agency · Pokhara</p>
          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 tracking-tight leading-[1.15] mb-4 max-w-2xl mx-auto">
            {BRAND.name}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
            {BRAND.tagline}
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8" role="search">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 sm:p-2 bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden />
                <label htmlFor="home-search" className="sr-only">Search jobs</label>
                <input
                  id="home-search"
                  type="search"
                  placeholder="Job title, skill or keyword"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border-0 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  autoComplete="off"
                />
              </div>
              <label htmlFor="home-location" className="sr-only">Location</label>
              <select
                id="home-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 px-3 rounded-xl border-0 bg-slate-50 sm:bg-transparent text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <Button type="submit" size="lg" className="h-12 px-8 rounded-xl shrink-0">
                Find jobs
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/jobs">
              <Button size="lg" className="min-w-[168px] rounded-xl">
                <Briefcase className="w-5 h-5" aria-hidden /> Find jobs
              </Button>
            </Link>
            <Link to="/for-businesses">
              <Button variant="outline" size="lg" className="min-w-[168px] rounded-xl">
                <Users className="w-5 h-5" aria-hidden /> Hire staff
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-100 bg-white">
        <div className="cj-container py-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4 text-[#0066FF]" aria-hidden /> Agency-reviewed applications</span>
          <span className="inline-flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#0066FF]" aria-hidden /> WhatsApp support</span>
          <span className="inline-flex items-center gap-2"><Briefcase className="w-4 h-4 text-[#0066FF]" aria-hidden /> Pokhara & Nepal roles</span>
        </div>
      </section>

      {/* Job seekers */}
      <section className="py-16 bg-slate-50">
        <div className="cj-container">
          <h2 className="text-2xl font-bold text-center tracking-tight mb-2">For job seekers</h2>
          <p className="text-slate-600 text-center mb-10 max-w-lg mx-auto">
            Find roles without complicated forms. CareerJob reviews every application.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Find a job', desc: 'Search by title, skill or location' },
              { step: '2', title: 'Apply online', desc: 'One profile — apply in under a minute' },
              { step: '3', title: 'We review', desc: 'Our team screens every application' },
              { step: '4', title: 'Get contacted', desc: 'We reach out for the next step' },
              { step: '5', title: 'Interview', desc: 'We coordinate with the employer' },
              { step: '6', title: 'Get placed', desc: 'Start your new role with support' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/jobs"><Button size="lg" className="rounded-xl">Browse open jobs</Button></Link>
          </div>
        </div>
      </section>

      {/* Businesses */}
      <section className="py-16">
        <div className="cj-container text-center max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Need staff?</h2>
          <p className="text-slate-600 mb-8">Tell CareerJob what you need. We handle recruitment.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
            {[
              { title: 'Submit a request', desc: 'Role, headcount, location and requirements' },
              { title: 'We recruit', desc: 'Screening and shortlist from real applicants' },
              { title: 'Interview & place', desc: 'You select; we support joining' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl border border-slate-200 bg-white">
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/for-businesses">
            <Button size="lg" className="rounded-xl">
              Request staff <ArrowRight className="w-4 h-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0066FF] text-white">
        <div className="cj-container text-center max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Talk to CareerJob</h2>
          <p className="mb-6 text-white/90 leading-relaxed">
            Questions about a role or hiring? Message us on WhatsApp — we respond quickly.
          </p>
          <WhatsAppButton
            message="Hello CareerJob, I want to know more about your job opportunities."
            label="Chat on WhatsApp"
            className="!bg-white !text-[#0066FF] hover:!bg-slate-100 !rounded-xl"
          />
        </div>
      </section>
    </div>
  );
}
