'use client';

import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AdminFilterBarProps {
  searchPlaceholder?: string;
  value?: string;
  onChange?: (next: string) => void;
  children?: ReactNode;
  className?: string;
}

/**
 * Filter bar — search input + slot for chips/dropdowns.
 * Controlled when `value` and `onChange` are both supplied; otherwise
 * uncontrolled and visual-only (legacy use).
 */
export function AdminFilterBar({
  searchPlaceholder = 'Search…',
  value,
  onChange,
  children,
  className,
}: AdminFilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-border-hairline px-6 py-4 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="relative flex-1 md:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          strokeWidth={1.5}
        />
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={value ?? undefined}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="h-10 w-full border border-border-hairline bg-bg-canvas pl-9 pr-3 text-caption text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2"
        />
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
