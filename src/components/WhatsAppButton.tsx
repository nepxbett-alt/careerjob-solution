import { MessageCircle } from 'lucide-react';
import { buildGenericWhatsAppUrl, buildJobWhatsAppUrl, type WhatsAppJobInput } from '../lib/whatsapp';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/cn';

interface Props {
  /** Generic pre-filled message when no job is provided */
  message?: string;
  /** When set, message is built dynamically from this job (overrides `message`) */
  job?: WhatsAppJobInput | null;
  className?: string;
  floating?: boolean;
  label?: string;
  /** Optional source label for aria / future analytics */
  source?: string;
}

export function WhatsAppButton({
  message = 'Hello CareerJob, I want to know more about your job opportunities.',
  job,
  className = '',
  floating = false,
  label = 'Chat with CareerJob',
  source,
}: Props) {
  const { lang } = useI18n();

  const href = job
    ? buildJobWhatsAppUrl(job, lang)
    : buildGenericWhatsAppUrl(message);

  const title = job?.title?.trim();
  const ariaLabel = job
    ? title
      ? `Contact CareerJob Solution about ${title} on WhatsApp`
      : 'Contact CareerJob Solution about this job on WhatsApp'
    : 'Chat with CareerJob Solution on WhatsApp';

  const handleClick = () => {
    // Optional safe analytics hook if the host defines one
    try {
      const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
      if (job && typeof w.gtag === 'function') {
        w.gtag('event', 'whatsapp_job_contact', {
          job_id: job.id,
          job_title: title || undefined,
          source: source || undefined,
        });
      }
    } catch {
      // ignore
    }
  };

  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={cn(
          'fixed z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white',
          'shadow-lg shadow-emerald-900/20 hover:bg-[#20bd5a] hover:scale-105 active:scale-95 transition-all',
          'right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-6',
          className,
        )}
        aria-label={ariaLabel}
      >
        <MessageCircle className="w-7 h-7" aria-hidden />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 h-11 rounded-[10px] bg-[#25D366] text-white font-medium',
        'hover:bg-[#20bd5a] transition-colors min-h-[44px]',
        !label && 'gap-0 px-0 w-11',
        className,
      )}
      aria-label={ariaLabel}
    >
      <MessageCircle className="w-5 h-5 shrink-0" aria-hidden />
      {label ? <span>{label}</span> : null}
    </a>
  );
}
