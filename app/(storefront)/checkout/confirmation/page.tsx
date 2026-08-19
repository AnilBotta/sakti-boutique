import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, Info } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { getOrderSummary } from '@/lib/checkout/orders';
import { ClearCartOnMount } from './ClearCart';

export const metadata: Metadata = {
  title: 'Order Confirmation',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const money = (n: number) => `$${n.toFixed(2)}`;

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string; demo?: string };
}) {
  const orderNumber = searchParams.order;
  const order = orderNumber ? await getOrderSummary(orderNumber) : null;

  // No real order → generic message (also the old ?demo=1 preview path).
  if (!order) {
    return (
      <Container
        width="text"
        className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"
      >
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border-hairline text-text-secondary">
          <Info className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h1 className="text-h2 font-medium text-text-primary md:text-h1">
          {orderNumber ? 'Finalizing your order…' : 'Nothing to confirm here'}
        </h1>
        <p className="mt-5 text-body text-text-secondary">
          {orderNumber
            ? 'Your payment is being confirmed. This can take a few seconds — your emailed receipt is the source of truth.'
            : 'No order reference was provided.'}
        </p>
        <div className="mt-10">
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

  return (
    <Container width="text" className="py-16 md:py-20">
      <ClearCartOnMount />
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-state-success/40 text-state-success">
          <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <p className="eyebrow mb-3 text-accent-ember">Thank you</p>
        <h1 className="text-h2 font-medium text-text-primary md:text-h1">
          Your order is confirmed
        </h1>
        <p className="mt-4 text-body text-text-secondary">
          Order <span className="font-medium text-text-primary">{order.number}</span>
          {order.email ? <> · a receipt is on its way to {order.email}</> : null}
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl border border-border-hairline bg-bg-canvas p-6">
        <ul className="flex flex-col gap-4 border-b border-border-hairline pb-5">
          {order.lines.map((l, i) => (
            <li key={i} className="flex items-start justify-between gap-4 text-caption">
              <span className="text-text-secondary">
                {l.name}
                {l.variantLabel && <span className="text-text-muted"> · {l.variantLabel}</span>}
                <span className="text-text-muted"> × {l.quantity}</span>
              </span>
              <span className="nums-tabular text-text-primary">
                {money(l.price * l.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 flex flex-col gap-3 text-caption">
          <div className="flex items-center justify-between">
            <dt className="text-text-secondary">Subtotal</dt>
            <dd className="nums-tabular text-text-primary">{money(order.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-secondary">Shipping</dt>
            <dd className="nums-tabular text-text-primary">{money(order.shipping)}</dd>
          </div>
          {order.tax > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">Tax</dt>
              <dd className="nums-tabular text-text-primary">{money(order.tax)}</dd>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border-hairline pt-4 text-body font-medium text-text-primary">
            <span>Total</span>
            <span className="nums-tabular">{money(order.total)}</span>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/women"
          className="inline-flex min-h-[48px] items-center justify-center bg-text-primary px-7 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </div>
    </Container>
  );
}
