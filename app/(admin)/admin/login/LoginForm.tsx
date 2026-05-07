'use client';

import { useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase/client';

interface Props {
  redirectTo: string;
}

export function LoginForm({ redirectTo }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus('sending');

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setStatus('error');
      setError('Authentication is not configured for this environment.');
      return;
    }

    // Magic links must land on /auth/callback so the server can exchange
    // the PKCE code for a session cookie. The original destination travels
    // along as `?next=...` and the callback redirects there once signed in.
    const emailRedirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : undefined;

    const { error: signInErr } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });
    if (signInErr) {
      setStatus('error');
      setError(signInErr.message);
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div className="rounded-md border border-border-hairline bg-bg-subtle p-5">
        <p className="mb-2 text-eyebrow uppercase tracking-[0.14em] text-accent-ember">
          Check your inbox
        </p>
        <p className="text-body text-text-primary">
          We sent a sign-in link to <strong>{email}</strong>. Click it from the
          same browser to finish signing in.
        </p>
      </div>
    );
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
      {error ? (
        <p className="text-caption text-state-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'sending' || !email}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent-ember px-6 text-button uppercase tracking-[0.02em] text-bg-canvas transition-transform duration-fast ease-standard hover:bg-accent-ember/95 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending link…' : 'Send magic link'}
      </button>
    </form>
  );
}
