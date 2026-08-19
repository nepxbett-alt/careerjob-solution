import { Link } from 'react-router-dom';
import { cn } from '../lib/cn';
import { BRAND } from '../lib/config';

type Props = {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  inverted?: boolean;
};

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
};

export function BrandLogo({
  to = '/',
  size = 'md',
  showWordmark = true,
  className,
  inverted = false,
}: Props) {
  const content = (
    <>
      <img
        src="/logo.png"
        alt=""
        width={44}
        height={44}
        className={cn(sizes[size], 'object-contain shrink-0')}
        decoding="async"
      />
      {showWordmark && (
        <span
          className={cn(
            'font-semibold tracking-tight truncate',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-[0.95rem]',
            size === 'lg' && 'text-lg',
            inverted ? 'text-white' : 'text-slate-900'
          )}
        >
          {BRAND.name}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={cn('inline-flex items-center gap-2.5 min-h-[44px]', className)}
        aria-label={BRAND.name}
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label={BRAND.name}>
      {content}
    </span>
  );
}
