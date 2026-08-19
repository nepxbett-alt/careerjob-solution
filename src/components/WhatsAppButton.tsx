import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '../lib/config';
import { cn } from '../lib/cn';

interface Props {
  message?: string;
  className?: string;
  floating?: boolean;
  label?: string;
}

export function WhatsAppButton({
  message = 'Hello CareerJob, I want to know more about your job opportunities.',
  className = '',
  floating = false,
  label = 'Chat with CareerJob',
}: Props) {
  const href = getWhatsAppLink(message);

  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'fixed z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white',
          'shadow-lg shadow-emerald-900/20 hover:bg-[#20bd5a] hover:scale-105 active:scale-95 transition-all',
          'right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-6',
          className
        )}
        aria-label="Chat on WhatsApp"
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
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 h-11 rounded-[10px] bg-[#25D366] text-white font-medium',
        'hover:bg-[#20bd5a] transition-colors min-h-[44px]',
        className
      )}
    >
      <MessageCircle className="w-5 h-5 shrink-0" aria-hidden />
      {label}
    </a>
  );
}
