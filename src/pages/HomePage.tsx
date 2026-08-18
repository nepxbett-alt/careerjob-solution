import { Link, useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, ArrowRight } from 'lucide-react';
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
    if (query) params.set('q', query);
    if (location && location !== 'All Nepal') params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            {BRAND.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {BRAND.tagline}
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, positions or skills"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] outline-none text-base"
                />
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 px-4 rounded-lg border border-gray-300 focus:border-[#0066FF] outline-none text-base bg-white"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <Button type="submit" size="lg" className="h-12 px-8">Find Jobs</Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/jobs">
              <Button size="lg" className="min-w-[160px]">
                <Briefcase className="w-5 h-5 mr-2" /> Find Jobs
              </Button>
            </Link>
            <Link to="/for-businesses">
              <Button variant="outline" size="lg" className="min-w-[160px]">
                <Users className="w-5 h-5 mr-2" /> Hire Staff
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">For Job Seekers</h2>
          <p className="text-gray-600 text-center mb-10">Find jobs without complicated applications.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Find a job', desc: 'Search by title, skill or location' },
              { step: '2', title: 'Apply online', desc: 'One-minute application with your profile' },
              { step: '3', title: 'CareerJob reviews', desc: 'Our team reviews every application' },
              { step: '4', title: 'Get contacted', desc: 'We reach out for the next step' },
              { step: '5', title: 'Attend interview', desc: 'We coordinate the interview' },
              { step: '6', title: 'Get placed', desc: 'Start your new role' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Need staff?</h2>
          <p className="text-gray-600 mb-8">Tell CareerJob what you need. We handle recruitment.</p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10 text-left">
            {[
              { title: 'Submit requirement', desc: 'Tell us the position, location and requirements' },
              { title: 'We recruit', desc: 'CareerJob finds and shortlists suitable candidates' },
              { title: 'Interview & place', desc: 'You interview and we complete the placement' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-gray-200">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/for-businesses">
            <Button size="lg">Request Staff <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-[#0066FF] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Talk to CareerJob</h2>
          <p className="mb-6 opacity-90">Questions about jobs or hiring? Message us on WhatsApp.</p>
          <WhatsAppButton
            message="Hello CareerJob, I want to know more about your job opportunities."
            label="Chat with CareerJob"
            className="!bg-white !text-[#0066FF] hover:!bg-gray-100"
          />
        </div>
      </section>
    </div>
  );
}
