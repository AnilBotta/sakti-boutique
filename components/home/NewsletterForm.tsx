'use client';

import { useState, useTransition } from 'react';
import { subscribeAction } from '@/lib/actions/storefront-newsletter';
import { cn } from '@/lib/utils/cn';

interface NewsletterFormProps {
  /** Identifier for where the form is placed — stored alongside the email. */
  source?: string;
}

/**
 * Subscribe-to-newsletter form. Calls `subscribeAction` on submit; replaces
 * the input + button with a friendly confirmation on success. Treats
 * already-subscribed as success (no scary "you exist" error).
 */
export function NewsletterForm({ source = 'homepage' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ wasNew: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('email', email);
      fd.set('source', source);
      const res = await subscribeAction(fd);
      if (res.ok) {
        setSuccess({ wasNew: !!res.isNew });
        setEmail('');
        return;
      }
      setError(res.message ?? 'Something went wrong. Please try again.');
    });
  }

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-8 rounded-md border border-state-success/30 bg-bg-canvas px-5 py-4 text-body text-text-primary"
      >
        {success.wasNew
          ? 'Welcome to the atelier — look out for our next letter.'
          : "You're already on the list — we'll be in touch soon."}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className={cn(
          'h-12 flex-1 rounded-md border bg-bg-canvas px-4 text-body text-text-primary placeholder:text-text-muted transition-colors duration-fast ease-standard focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2',
          error
            ? 'border-accent-crimson focus:border-accent-crimson'
            : 'border-border focus:border-accent-ember',
        )}
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-md bg-accent-ember px-7 text-button font-medium uppercase tracking-[0.02em] text-bg-canvas transition-all duration-fast ease-standard hover:bg-[#b04e16] active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Subscribing…' : 'Subscribe'}
      </button>
      {error && (
        <p
          role="alert"
          className="basis-full text-caption text-accent-crimson sm:order-last"
        >
          {error}
        </p>
      )}
    </form>
  );
}
