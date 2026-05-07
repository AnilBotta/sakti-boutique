'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase/client';

interface Props {
  redirectTo: string;
}

export function LoginForm({ redirectTo }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setSubmitting(false);
      setError('Authentication is not configured for this environment.');
      return;
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInErr) {
      setSubmitting(false);
      setError(signInErr.message);
      return;
    }

    // Refresh so the new session cookie is read by the next RSC render,
    // then push to the requested destination.
    router.refresh();
    router.push(redirectTo);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-eyebrow uppercase tracking-[0.14em] text-text-secondary"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-md border border-border-default bg-bg-canvas px-4 text-body text-text-primary outline-none transition-colors duration-fast ease-standard focus:border-accent-ember focus:ring-2 focus:ring-accent-ember/30"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-eyebrow uppercase tracking-[0.14em] text-text-secondary"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-md border border-border-default bg-bg-canvas px-4 text-body text-text-primary outline-none transition-colors duration-fast ease-standard focus:border-accent-ember focus:ring-2 focus:ring-accent-ember/30"
          placeholder="••••••••"
        />
      </div>
      {error ? (
        <p className="text-caption text-state-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting || !email || !password}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent-ember px-6 text-button uppercase tracking-[0.02em] text-bg-canvas transition-transform duration-fast ease-standard hover:bg-accent-ember/95 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
