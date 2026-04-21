'use client';

import { cn } from '@/lib/utils/cn';

interface AdminToggleProps {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Row-style toggle: label + description on the left, switch on the right.
 * Uses a button with aria-pressed for accessibility — no native checkbox
 * styling headaches, works with keyboard (Space/Enter).
 */
export function AdminToggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
  className,
}: AdminToggleProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-6 py-3',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="block text-body font-medium text-text-primary"
        >
          {label}
        </label>
        {description && (
          <p className="mt-1 text-caption text-text-muted">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 items-center border transition-colors duration-fast ease-standard',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember/40 focus-visible:ring-offset-2',
          checked
            ? 'border-accent-ember bg-accent-ember'
            : 'border-border-default bg-bg-muted',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'pointer-events-none inline-block h-4 w-4 transform bg-bg-canvas transition-transform duration-fast ease-standard',
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]',
          )}
        />
      </button>
    </div>
  );
}
