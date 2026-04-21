import Link from 'next/link';
import type { Metadata } from 'next';
import { Info } from 'lucide-react';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Checkout Preview',
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return (
    <Container
      width="text"
      className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border-hairline text-text-secondary">
        <Info className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <p className="eyebrow mb-4 text-accent-ember">Preview</p>
      <h1 className="text-h2 font-medium text-text-primary md:text-h1">
        This is a checkout shell, not a real order.
      </h1>
      <p className="mt-5 text-body text-text-secondary">
        No payment was processed and no order has been placed. Real checkout,
        payment, and order confirmation arrive in a later step.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/cart"
          className="inline-flex min-h-[48px] items-center justify-center border border-text-primary px-7 text-caption font-medium uppercase tracking-[0.16em] text-text-primary transition-colors duration-fast ease-standard hover:bg-text-primary hover:text-bg-canvas"
        >
          Back to Cart
        </Link>
        <Link
          href="/women"
          className="inline-flex min-h-[48px] items-center justify-center bg-text-primary px-7 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
        >
          Continue Browsing
        </Link>
      </div>
    </Container>
  );
}
