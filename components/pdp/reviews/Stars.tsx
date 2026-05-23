import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StarsProps {
  /** 0–5; non-integers render the nearest integer (no half stars). */
  value: number;
  /** Tailwind size class, e.g. "h-4 w-4". Default "h-4 w-4". */
  sizeClass?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Read-only star display used in the PDP review summary and review cards.
 * Saffron-filled per the design system; outline state uses border-default.
 */
export function Stars({
  value,
  sizeClass = 'h-4 w-4',
  className,
  ariaLabel,
}: StarsProps) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
      aria-label={ariaLabel ?? `${filled} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          strokeWidth={1.5}
          fill={i < filled ? 'currentColor' : 'none'}
          className={cn(
            sizeClass,
            i < filled ? 'text-accent-saffron' : 'text-border-default',
          )}
        />
      ))}
    </span>
  );
}
