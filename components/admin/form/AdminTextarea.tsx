'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface AdminTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  function AdminTextarea({ className, invalid, rows = 4, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full bg-bg-canvas px-3 py-2 text-body leading-relaxed text-text-primary',
          'border border-border-default placeholder:text-text-muted',
          'transition-colors duration-fast ease-standard resize-y',
          'focus:outline-none focus:border-accent-ember focus:ring-2 focus:ring-accent-ember/30',
          invalid && 'border-accent-crimson focus:border-accent-crimson focus:ring-accent-crimson/30',
          className,
        )}
        {...props}
      />
    );
  },
);
