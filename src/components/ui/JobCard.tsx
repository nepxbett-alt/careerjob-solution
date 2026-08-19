import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '../../services/jobService';

export function JobCard({ job }: { job: Job }) {
  const locationLabel = job.location_detail
    ? `${job.location_detail}, ${job.location}`
    : job.location;

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-[#0066FF]/35 hover:shadow-md transition-all duration-150 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-[1.05rem] text-slate-900 tracking-tight group-hover:text-[#0066FF] transition-colors leading-snug">
            {job.title}
          </h2>
          {job.public_employer_label && (
            <p className="text-sm text-slate-500 mt-0.5 truncate">{job.public_employer_label}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[13px] text-slate-600">
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
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.salary_display && (
              <span className="text-[13px] font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                {job.salary_display}
              </span>
            )}
            <span className="text-[13px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg capitalize">
              {job.job_type.replace('-', ' ')}
            </span>
            {job.experience_required && (
              <span className="text-[13px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                {job.experience_required}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#0066FF] shrink-0 mt-1 transition-colors" aria-hidden />
      </div>
    </Link>
  );
}
