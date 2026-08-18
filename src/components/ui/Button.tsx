import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-[10px] transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0066FF]',
          'disabled:opacity-50 disabled:pointer-events-none',
          'active:scale-[0.98]',
          {
            'bg-[#0066FF] text-white hover:bg-[#0052CC] shadow-sm': variant === 'primary',
            'bg-slate-100 text-slate-900 hover:bg-slate-200': variant === 'secondary',
            'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400': variant === 'outline',
            'text-slate-700 hover:bg-slate-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
            'bg-emerald-600 text-white hover:bg-emerald-700': variant === 'success',
            'h-9 px-3 text-sm min-w-[2.25rem]': size === 'sm',
            'h-11 px-4 text-sm min-w-[2.75rem]': size === 'md',
            'h-12 px-6 text-base min-w-[3rem]': size === 'lg',
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
