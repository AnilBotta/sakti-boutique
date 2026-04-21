import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface AdminFieldRowProps {
  /** Field label (rendered as eyebrow above the control). */
  label: ReactNode;
  /** Stable id used to associate label with the control via htmlFor. */
  htmlFor?: string;
  /** Optional helper text below the control. */
  helper?: ReactNode;
  /** Optional error caption — overrides helper visually. */
  error?: ReactNode;
  /** Mark the field as required (adds a subtle asterisk). */
  required?: boolean;
  /** Width hint. Defaults to full. */
  span?: 'full' | 'half';
  className?: string;
  children: ReactNode;
}

/**
 * Single labeled field row. Eyebrow label above, control below,
 * helper/error caption at the bottom. Spans the full column by default.
 * Use inside `AdminFormSection` bodies.
 */
export function AdminFieldRow({
  label,
  htmlFor,
  helper,
  error,
  required,
  span = 'full',
  className,
  children,
}: AdminFieldRowProps) {
  const describedBy = error
    ? `${htmlFor}-error`
    : helper
      ? `${htmlFor}-helper`
      : undefined;

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        span === 'half' && 'sm:max-w-[260px]',
        className,
      )}
    >
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary"
      >
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-accent-ember">
            *
          </span>
        )}
      </label>
      {/* Clone-friendly wrapper so children can consume aria-describedby via props */}
      <div data-described-by={describedBy}>{children}</div>
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          className="text-caption text-accent-crimson"
        >
          {error}
        </p>
      ) : helper ? (
        <p
          id={htmlFor ? `${htmlFor}-helper` : undefined}
          className="text-caption text-text-muted"
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
}
