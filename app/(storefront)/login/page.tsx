import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { LoginClient } from './LoginClient';
import { getCurrentCustomer } from '@/lib/auth/customer';

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in to your Sakthi Trends USA account, or continue as a guest.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: { redirect?: string };
}

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: PageProps) {
  // Already signed in? Skip the form and send them on.
  const session = await getCurrentCustomer();
  const redirectTo = searchParams.redirect || '/account';
  if (session) redirect(redirectTo);

  return (
    <Container width="text" className="py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <header className="mb-10 text-center">
          <p className="eyebrow text-accent-ember">Welcome to the atelier</p>
          <h1 className="mt-3 text-h1 font-medium leading-[1.05] text-text-primary md:text-display">
            Your account
          </h1>
          <p className="mt-4 text-body text-text-secondary">
            Sign in to view orders, save addresses, and personalise your
            experience.
          </p>
        </header>

        <LoginClient redirectTo={redirectTo} />
      </div>
    </Container>
  );
}
