'use client';

import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils/cn';

type FieldKey = 'name' | 'email' | 'subject' | 'message';

interface FieldState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialState: FieldState = {
  name: '',
  email: '',
  subject: 'general',
  message: '',
};

const SUBJECTS: Array<{ value: string; label: string }> = [
  { value: 'general', label: 'General enquiry' },
  { value: 'order', label: 'Order or delivery' },
  { value: 'sizing', label: 'Sizing & fit' },
  { value: 'custom', label: 'Custom or bespoke' },
  { value: 'press', label: 'Press & collaborations' },
];

/**
 * Contact form UI shell. Controlled inputs with local validation + a
 * local success state. There is no fetch, no server action, no email
 * delivery — submission is intentionally a no-op beyond the success
 * acknowledgement. Step 12+ will wire this to a real backend.
 */
export function ContactFormShell() {
  const [values, setValues] = useState<FieldState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: FieldKey) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!values.name.trim()) next.name = 'Please share your name.';
    if (!values.email.trim()) {
      next.email = 'Please share an email we can reply to.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'That email address looks incomplete.';
    }
    if (values.message.trim().length < 10) {
      next.message = 'A short message (at least 10 characters) helps us reply well.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    // No network call. This is a UI shell.
    setSubmitted(true);
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border border-border-hairline bg-bg-subtle p-8 md:p-10"
      >
        <p className="eyebrow text-accent-ember">Message received</p>
        <h3 className="mt-3 text-[1.5rem] font-medium leading-snug text-text-primary md:text-[1.75rem]">
          Thank you — we&rsquo;ll be in touch soon.
        </h3>
        <p className="mt-3 max-w-lg text-body text-text-secondary">
          A member of the Sakthi atelier will reply to <strong>{values.email}</strong>{' '}
          personally. If your note is time-sensitive, you can also reach us through
          any of the contact methods listed.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center justify-center border border-border px-6 text-button font-medium uppercase tracking-[0.02em] text-text-primary transition-colors duration-fast ease-standard hover:border-accent-ember hover:text-accent-ember"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6 border border-border-hairline p-6 md:p-8"
      aria-label="Contact form"
    >
      <Field
        id="contact-name"
        label="Your name"
        required
        error={errors.name}
      >
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={update('name')}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={inputClass(Boolean(errors.name))}
        />
      </Field>

      <Field
        id="contact-email"
        label="Email"
        required
        error={errors.email}
      >
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={inputClass(Boolean(errors.email))}
        />
      </Field>

      <Field id="contact-subject" label="Subject">
        <div className="relative">
          <select
            id="contact-subject"
            value={values.subject}
            onChange={update('subject')}
            className={cn(inputClass(false), 'appearance-none pr-10')}
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
          >
            ▾
          </span>
        </div>
      </Field>

      <Field
        id="contact-message"
        label="Message"
        required
        error={errors.message}
      >
        <textarea
          id="contact-message"
          rows={6}
          value={values.message}
          onChange={update('message')}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={cn(
            'w-full border bg-bg-canvas px-4 py-3 text-body text-text-primary placeholder:text-text-muted outline-none transition-colors duration-fast ease-standard focus:border-accent-ember',
            errors.message ? 'border-state-danger' : 'border-border',
          )}
        />
      </Field>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-text-muted">
          We read every message. Replies are personal, not automated.
        </p>
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center bg-accent-ember px-7 text-button font-medium uppercase tracking-[0.02em] text-bg-canvas transition-all duration-fast ease-standard hover:bg-[#b04e16] active:scale-[0.985] sm:w-auto"
        >
          Send message
        </button>
      </div>
    </form>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    'h-11 w-full border bg-bg-canvas px-4 text-body text-text-primary placeholder:text-text-muted outline-none transition-colors duration-fast ease-standard focus:border-accent-ember',
    invalid ? 'border-state-danger' : 'border-border',
  );
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="eyebrow text-text-secondary"
      >
        {label}
        {required && <span className="ml-1 text-accent-ember">*</span>}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="text-caption text-state-danger"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
