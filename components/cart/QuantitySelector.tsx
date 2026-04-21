'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const h = size === 'sm' ? 'h-10' : 'h-11';
  const btn =
    'flex h-11 w-11 items-center justify-center text-text-primary transition-colors duration-fast ease-standard hover:text-accent-ember disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div
      className={cn(
        'inline-flex items-center border border-border-hairline',
        h,
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={btn}
      >
        <Minus className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <span
        aria-live="polite"
        className="min-w-8 text-center text-caption font-medium text-text-primary nums-tabular"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={btn}
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
