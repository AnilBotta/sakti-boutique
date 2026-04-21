'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CheckoutFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
  containerClassName?: string;
}

export const CheckoutFormField = forwardRef<HTMLInputElement, CheckoutFormFieldProps>(
  function CheckoutFormField(
    { label, error, helper, id, name, required, className, containerClassName, ...rest },
    ref,
  ) {
    const fieldId = id ?? name ?? label.replace(/\s+/g, '-').toLowerCase();
    const errId = `${fieldId}-err`;
    const helpId = `${fieldId}-help`;

    return (
      <div className={cn('flex flex-col', containerClassName)}>
        <label
          htmlFor={fieldId}
          className="eyebrow mb-2 text-text-secondary"
        >
          {label}
          {required && <span aria-hidden className="ml-1 text-accent-ember">*</span>}
        </label>
        <input
          ref={ref}
          id={fieldId}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : helper ? helpId : undefined}
          className={cn(
            'h-11 w-full border bg-bg-canvas px-4 text-body text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
            error ? 'border-state-danger' : 'border-border-hairline',
            className,
          )}
          {...rest}
        />
        {error ? (
          <p id={errId} role="alert" className="mt-2 text-caption text-accent-crimson">
            {error}
          </p>
        ) : helper ? (
          <p id={helpId} className="mt-2 text-caption text-text-muted">
            {helper}
          </p>
        ) : null}
      </div>
    );
  },
);
