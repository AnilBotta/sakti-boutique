import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface EditorialBlockProps {
  media: ReactNode;
  children: ReactNode;
  reverse?: boolean;
  className?: string;
}

/**
 * Asymmetric image / text editorial block — 12-col grid, 5/7 split desktop,
 * stacked on mobile (image first, then content).
 */
export function EditorialBlock({
  media,
  children,
  reverse = false,
  className,
}: EditorialBlockProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12 lg:gap-16',
        className,
      )}
    >
      <div className={cn('md:col-span-7', reverse && 'md:order-2')}>{media}</div>
      <div
        className={cn(
          'md:col-span-5 flex flex-col justify-center',
          reverse && 'md:order-1',
        )}
      >
        {children}
      </div>
    </div>
  );
}
