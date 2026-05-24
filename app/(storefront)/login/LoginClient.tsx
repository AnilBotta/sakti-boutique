'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  signInAction,
  signUpAction,
  type AuthActionResult,
} from '@/lib/actions/storefront-auth';
import { cn } from '@/lib/utils/cn';

interface Props {
  redirectTo: string;
}

type Mode = 'signin' | 'signup';

interface FormState {
  fullName: string;
  email: string;
  password: string;
}

const initialState: FormState = {
  fullName: '',
  email: '',
  password: '',
};

export function LoginClient({ redirectTo }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [state, setState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<AuthActionResult['fieldErrors']>({});
  const [topMessage, setTopMessage] = useState<{
    tone: 'error' | 'info';
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setTopMessage(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setTopMessage(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('email', state.email);
      fd.set('password', state.password);
      fd.set('redirect', redirectTo);
      if (mode === 'signup') fd.set('fullName', state.fullName);

      const res =
        mode === 'signin' ? await signInAction(fd) : await signUpAction(fd);

      if (res.ok) {
        // router.refresh() forces RSC re-render with the new session cookie
        // already present, then push to the final destination.
        router.refresh();
        router.push(res.redirectTo ?? '/account');
        return;
      }
      if (res.fieldErrors) setErrors(res.fieldErrors);
      if (res.message) {
        setTopMessage({
          tone: 'needsConfirmation' in res && res.needsConfirmation ? 'info' : 'error',
          text: res.message,
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Sign in or create an account"
        className="grid grid-cols-2 gap-0 border border-border-default"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          onClick={() => switchMode('signin')}
          className={cn(
            'h-11 text-caption font-medium uppercase tracking-[0.12em] transition-colors duration-fast ease-standard',
            mode === 'signin'
              ? 'bg-text-primary text-bg-canvas'
              : 'bg-bg-canvas text-text-secondary hover:bg-bg-subtle',
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          onClick={() => switchMode('signup')}
          className={cn(
            'h-11 text-caption font-medium uppercase tracking-[0.12em] transition-colors duration-fast ease-standard',
            mode === 'signup'
              ? 'bg-text-primary text-bg-canvas'
              : 'bg-bg-canvas text-text-secondary hover:bg-bg-subtle',
          )}
        >
          Create account
        </button>
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        {mode === 'signup' && (
          <label className="block">
            <span className="eyebrow mb-2 block text-text-secondary">
              Your name
            </span>
            <input
              type="text"
              autoComplete="name"
              value={state.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className={cn(
                'h-11 w-full border bg-bg-canvas px-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
                errors?.fullName
                  ? 'border-accent-crimson'
                  : 'border-border-default',
              )}
              placeholder="How should we greet you?"
            />
            {errors?.fullName && (
              <p className="mt-1 text-caption text-accent-crimson">
                {errors.fullName}
              </p>
            )}
          </label>
        )}

        <label className="block">
          <span className="eyebrow mb-2 block text-text-secondary">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={state.email}
            onChange={(e) => update('email', e.target.value)}
            className={cn(
              'h-11 w-full border bg-bg-canvas px-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
              errors?.email
                ? 'border-accent-crimson'
                : 'border-border-default',
            )}
            placeholder="you@example.com"
          />
          {errors?.email && (
            <p className="mt-1 text-caption text-accent-crimson">
              {errors.email}
            </p>
          )}
        </label>

        <label className="block">
          <span className="eyebrow mb-2 block text-text-secondary">
            Password{' '}
            {mode === 'signup' && (
              <span className="lowercase tracking-normal text-text-muted">
                (at least 8 characters)
              </span>
            )}
          </span>
          <input
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={state.password}
            onChange={(e) => update('password', e.target.value)}
            className={cn(
              'h-11 w-full border bg-bg-canvas px-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-ember focus:ring-offset-2',
              errors?.password
                ? 'border-accent-crimson'
                : 'border-border-default',
            )}
            placeholder="••••••••"
          />
          {errors?.password && (
            <p className="mt-1 text-caption text-accent-crimson">
              {errors.password}
            </p>
          )}
        </label>

        {topMessage && (
          <div
            role={topMessage.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'rounded-md border px-4 py-3 text-caption',
              topMessage.tone === 'error'
                ? 'border-accent-crimson/30 bg-bg-canvas text-accent-crimson'
                : 'border-state-success/30 bg-bg-canvas text-text-primary',
            )}
          >
            {topMessage.text}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center rounded-md bg-accent-ember px-6 text-button font-medium uppercase tracking-[0.02em] text-bg-canvas transition-all duration-fast ease-standard hover:bg-[#b04e16] active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? mode === 'signin'
              ? 'Signing in…'
              : 'Creating account…'
            : mode === 'signin'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>

      <div className="border-t border-border-hairline pt-6 text-center">
        <Link
          href="/"
          className="text-caption uppercase tracking-[0.12em] text-text-secondary underline underline-offset-4 transition-colors duration-fast ease-standard hover:text-text-primary"
        >
          Continue as guest
        </Link>
        <p className="mt-3 text-caption text-text-muted">
          You can still browse, add to cart, and check out without an account.
        </p>
      </div>
    </div>
  );
}
