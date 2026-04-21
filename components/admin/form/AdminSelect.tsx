'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface AdminSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/**
 * Native select styled to match admin inputs. Keeping it native preserves
 * mobile keyboards, screen reader support, and cross-platform behavior.
 */
export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  function AdminSelect({ className, invalid, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            'h-10 w-full appearance-none bg-bg-canvas pl-3 pr-9 text-body text-text-primary',
            'border border-border-default',
            'transition-colors duration-fast ease-standard',
            'focus:outline-none focus:border-accent-ember focus:ring-2 focus:ring-accent-ember/30',
            invalid && 'border-accent-crimson focus:border-accent-crimson focus:ring-accent-crimson/30',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          strokeWidth={1.5}
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        />
      </div>
    );
  },
);
