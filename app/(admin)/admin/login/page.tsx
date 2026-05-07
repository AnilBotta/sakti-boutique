import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Admin Sign In · Sakthi',
  description: 'Sign in to the Sakthi admin console.',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-subtle px-5">
      <div className="w-full max-w-md rounded-lg border border-border-hairline bg-bg-canvas p-8 md:p-10">
        <p className="mb-3 text-eyebrow uppercase tracking-[0.14em] text-accent-ember">
          Admin
        </p>
        <h1 className="mb-3 text-3xl font-medium tracking-[-0.015em] text-text-primary md:text-4xl">
          Sign in
        </h1>
        <p className="mb-8 text-body text-text-secondary">
          Enter your email to receive a sign-in link. Only authorized admins can
          access the console.
        </p>
        <LoginForm redirectTo={searchParams.redirect ?? '/admin'} />
        <p className="mt-8 text-caption text-text-muted">
          Not an admin?{' '}
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to the storefront
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
