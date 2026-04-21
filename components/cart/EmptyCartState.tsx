import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface EmptyCartStateProps {
  variant?: 'drawer' | 'page';
  onAction?: () => void;
}

export function EmptyCartState({ variant = 'page', onAction }: EmptyCartStateProps) {
  const compact = variant === 'drawer';
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        compact ? 'px-6 py-16' : 'px-6 py-24 md:py-32',
      )}
    >
      <p className="eyebrow mb-4 text-accent-ember">Your cart</p>
      <h2
        className={cn(
          'font-medium text-text-primary',
          compact ? 'text-h3' : 'text-h2 md:text-h1',
        )}
      >
        Nothing here yet.
      </h2>
      <p className="mt-4 max-w-sm text-body text-text-secondary">
        Explore the atelier — every piece is hand-finished and crafted in small batches.
      </p>
      <Link
        href="/women"
        onClick={onAction}
        className="mt-8 inline-flex min-h-[48px] items-center justify-center bg-text-primary px-7 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
