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
      className="group block bg-white border border-[#E8ECF1] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(11,18,32,0.04)] hover:border-[#0066FF]/30 hover:shadow-[0_8px_24px_rgba(11,18,32,0.06)] transition-all duration-200 active:scale-[0.995]"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-[1.05rem] text-[#0B1220] tracking-tight group-hover:text-[#0066FF] transition-colors leading-snug">
            {job.title}
          </h2>
          {job.public_employer_label && (
            <p className="text-sm text-[#6B7789] mt-1 truncate">{job.public_employer_label}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-3 text-[13px] text-[#3D4A5C]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" aria-hidden />
              {locationLabel}
            </span>
            {job.job_categories?.name && (
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" aria-hidden />
                {job.job_categories.name}
              </span>
            )}
            {job.published_at && (
              <span className="inline-flex items-center gap-1.5 text-[#6B7789]">
                <Clock className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" aria-hidden />
                {formatDistanceToNow(new Date(job.published_at), { addSuffix: true })}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {job.salary_display && (
              <span className="text-[13px] font-semibold text-[#0B1220] bg-[#F7F9FC] px-2.5 py-1 rounded-lg border border-[#E8ECF1]">
                {job.salary_display}
              </span>
            )}
            <span className="text-[13px] text-[#3D4A5C] bg-[#F7F9FC] px-2.5 py-1 rounded-lg capitalize">
              {job.job_type.replace('-', ' ')}
            </span>
            {job.experience_required && (
              <span className="text-[13px] text-[#3D4A5C] bg-[#F7F9FC] px-2.5 py-1 rounded-lg">
                {job.experience_required}
              </span>
            )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#F7F9FC] group-hover:bg-[#EEF4FF] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
          <ChevronRight className="w-4 h-4 text-[#98A2B3] group-hover:text-[#0066FF] transition-colors" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
