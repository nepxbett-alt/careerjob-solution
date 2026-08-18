import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Briefcase, ArrowLeft } from 'lucide-react';
import { getJobById, Job } from '../services/jobService';
import { Button } from '../components/ui/Button';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJobById(id)
      .then(setJob)
      .catch(() => setError('Job not found or no longer available.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading…</div>;
  if (error || !job) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 mb-4">{error || 'Job not found'}</p>
        <Link to="/jobs"><Button>Back to Jobs</Button></Link>
      </div>
    );
  }

  const whatsappMsg = `Hello CareerJob, I am interested in the ${job.title} position in ${job.location}.`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-28">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0066FF] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-6">
        <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location_detail ? `${job.location_detail}, ${job.location}` : job.location}</span>
        {job.job_categories?.name && <span className="inline-flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.job_categories.name}</span>}
        {job.published_at && <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{formatDistanceToNow(new Date(job.published_at), { addSuffix: true })}</span>}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {job.salary_display && <span className="font-medium bg-gray-100 px-3 py-1 rounded-lg">{job.salary_display}</span>}
        <span className="bg-gray-50 px-3 py-1 rounded-lg capitalize">{job.job_type.replace('-', ' ')}</span>
        {job.experience_required && <span className="bg-gray-50 px-3 py-1 rounded-lg">{job.experience_required}</span>}
      </div>

      {job.public_employer_label && (
        <p className="text-sm text-gray-500 mb-6 italic">Employer: {job.public_employer_label}</p>
      )}

      {job.description && (
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Description</h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</div>
        </section>
      )}
      {job.responsibilities && (
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Responsibilities</h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.responsibilities}</div>
        </section>
      )}
      {job.requirements && (
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Requirements</h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.requirements}</div>
        </section>
      )}
      {job.benefits && (
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Benefits</h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.benefits}</div>
        </section>
      )}

      <p className="text-xs text-gray-400 mb-8">
        Employer details and exact interview information may be provided by CareerJob during the recruitment process.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <WhatsAppButton message={whatsappMsg} label="Ask CareerJob" />
      </div>

      {/* Sticky mobile Apply */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-bottom md:hidden z-30">
        <Button
          fullWidth
          size="lg"
          onClick={() => {
            if (!user) navigate('/login?redirect=/jobs/' + id);
            else navigate('/candidate/applications?apply=' + id);
          }}
        >
          Apply Now
        </Button>
      </div>

      {/* Desktop Apply */}
      <div className="hidden md:block mt-8">
        <Button
          size="lg"
          onClick={() => {
            if (!user) navigate('/login?redirect=/jobs/' + id);
            else navigate('/candidate/applications?apply=' + id);
          }}
        >
          Apply Now
        </Button>
      </div>
    </div>
  );
}
