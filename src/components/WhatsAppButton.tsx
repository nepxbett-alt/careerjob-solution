import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '../lib/config';

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
        className={`fixed bottom-20 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-colors md:bottom-6 ${className}`}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white font-medium hover:bg-[#20bd5a] transition-colors ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      {label}
    </a>
  );
}
