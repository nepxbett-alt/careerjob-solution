import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '../../services/jobService';
import { Button } from './Button';

export function JobCard({ job }: { job: Job }) {
  const locationLabel = job.location_detail
    ? `${job.location_detail}, ${job.location}`
    : job.location;

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block cj-card p-5 hover:border-[#0066FF]/35 hover:shadow-md transition-all duration-150"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-[1.05rem] text-slate-900 tracking-tight group-hover:text-[#0066FF] transition-colors">
            {job.title}
          </h2>
          {job.public_employer_label && (
            <p className="text-sm text-slate-500 mt-0.5 truncate">{job.public_employer_label}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden />
              {locationLabel}
            </span>
            {job.job_categories?.name && (
              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden />
                {job.job_categories.name}
              </span>
            )}
            {job.published_at && (
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden />
                {formatDistanceToNow(new Date(job.published_at), { addSuffix: true })}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {job.salary_display && (
              <span className="text-sm font-medium text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                {job.salary_display}
              </span>
            )}
            <span className="text-sm text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-md capitalize">
              {job.job_type.replace('-', ' ')}
            </span>
            {job.experience_required && (
              <span className="text-sm text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-md">
                {job.experience_required}
              </span>
            )}
          </div>
        </div>
        <Button size="sm" className="shrink-0 self-start pointer-events-none sm:pointer-events-auto" tabIndex={-1}>
          View job
        </Button>
      </div>
    </Link>
  );
}
