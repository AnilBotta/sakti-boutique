'use client';

import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { useCart, selectSubtotal, selectItemCount } from '@/lib/cart/store';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { PromoCodeField } from '@/components/cart/PromoCodeField';
import { EmptyCartState } from '@/components/cart/EmptyCartState';

export default function CartPage() {
  const items = useCart((s) => s.items);
  const sub = useCart(selectSubtotal);
  const count = useCart(selectItemCount);

  if (items.length === 0) {
    return (
      <Container className="py-10 md:py-16">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]}
          className="mb-6"
        />
        <EmptyCartState variant="page" />
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-16 lg:py-20">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]}
        className="mb-8"
      />
      <header className="mb-10 md:mb-14">
        <h1 className="text-h1 font-medium text-text-primary">Your Cart</h1>
        <p className="mt-2 text-caption text-text-muted">
          {count} {count === 1 ? 'item' : 'items'}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <ul className="divide-y divide-border-hairline border-y border-border-hairline">
            {items.map((it) => (
              <li key={it.id}>
                <CartLineItem item={it} variant="expanded" />
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <PromoCodeField />
            <div className="py-6">
              <CartSummary subtotal={sub} />
            </div>
            <Link
              href="/checkout"
              className="flex min-h-[52px] w-full items-center justify-center bg-text-primary px-6 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2"
            >
              Checkout
            </Link>
            <ul className="mt-6 grid grid-cols-1 gap-3 text-caption text-text-secondary sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
                Complimentary shipping available
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
                Easy returns on eligible items
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
                Secure checkout
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  );
}
