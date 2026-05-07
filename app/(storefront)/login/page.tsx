import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Sakthi Trends USA account.',
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-bg-canvas">
      <div className="mx-auto max-w-md px-5 py-20 md:py-28">
        <p className="mb-3 text-eyebrow uppercase tracking-[0.14em] text-accent-ember">
          Account
        </p>
        <h1 className="mb-6 text-3xl font-medium tracking-[-0.015em] text-text-primary md:text-4xl">
          Sign in
        </h1>
        <p className="mb-10 text-body text-text-secondary">
          Enter your email to receive a sign-in link. We&rsquo;ll send a magic link
          that signs you in without a password.
        </p>
        <LoginForm redirectTo={searchParams.redirect ?? '/admin'} />
      </div>
    </main>
  );
}
