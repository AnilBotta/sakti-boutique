import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ProductGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Product grid: 2 cols mobile · 3 tablet · 4 desktop.
 * Gaps 16/24/32. Never 5+ columns.
 */
export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
