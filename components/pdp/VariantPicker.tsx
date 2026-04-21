'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface VariantPickerProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  rightSlot?: ReactNode;
  idPrefix: string;
}

/**
 * Chip-style picker for size or color. ≥44px tall on mobile for comfortable tap targets.
 */
export function VariantPicker({
  label,
  options,
  value,
  onChange,
  error,
  rightSlot,
  idPrefix,
}: VariantPickerProps) {
  const groupId = `${idPrefix}-group`;
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <div id={groupId} className="eyebrow text-text-secondary">
          {label}
          {value && (
            <span className="ml-2 text-caption font-normal normal-case tracking-normal text-text-primary">
              {value}
            </span>
          )}
        </div>
        {rightSlot}
      </div>
      <div role="radiogroup" aria-labelledby={groupId} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt)}
              className={cn(
                'inline-flex min-h-[44px] items-center justify-center border px-4 text-caption uppercase tracking-[0.12em] transition-colors duration-fast ease-standard',
                selected
                  ? 'border-text-primary bg-text-primary text-bg-canvas'
                  : 'border-border-hairline bg-bg-canvas text-text-primary hover:border-text-primary',
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-caption text-accent-crimson">
          {error}
        </p>
      )}
    </div>
  );
}
