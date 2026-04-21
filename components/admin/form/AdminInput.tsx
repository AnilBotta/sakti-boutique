'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visual flag for invalid state; pairs with aria-invalid. */
  invalid?: boolean;
  /** Optional inline prefix (e.g. "$", "/"). */
  prefix?: string;
  /** Optional inline suffix (e.g. "USD", "kg"). */
  suffix?: string;
}

/**
 * Admin input: 40px tall, hairline border, ember focus ring, tabular
 * numerals when used for prices/numbers. Works with `AdminFieldRow`.
 */
export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  function AdminInput({ className, invalid, prefix, suffix, ...props }, ref) {
    const input = (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-10 w-full bg-bg-canvas px-3 text-body text-text-primary',
          'border border-border-default placeholder:text-text-muted',
          'transition-colors duration-fast ease-standard',
          'focus:outline-none focus:border-accent-ember focus:ring-2 focus:ring-accent-ember/30',
          invalid && 'border-accent-crimson focus:border-accent-crimson focus:ring-accent-crimson/30',
          (props.type === 'number' || prefix === '$') && 'nums-tabular',
          prefix && 'pl-8',
          suffix && 'pr-14',
          className,
        )}
        {...props}
      />
    );

    if (!prefix && !suffix) return input;

    return (
      <div className="relative">
        {prefix && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-caption text-text-muted"
          >
            {prefix}
          </span>
        )}
        {input}
        {suffix && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted"
          >
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
