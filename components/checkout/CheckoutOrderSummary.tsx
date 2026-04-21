'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { useCart, selectSubtotal, selectItemCount } from '@/lib/cart/store';
import { formatUSD } from '@/lib/cart/totals';
import { CartSummary } from '@/components/cart/CartSummary';
import { cn } from '@/lib/utils/cn';

export function CheckoutOrderSummary() {
  const items = useCart((s) => s.items);
  const sub = useCart(selectSubtotal);
  const count = useCart(selectItemCount);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside className="lg:sticky lg:top-28">
      {/* Mobile collapsible header */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        className="flex w-full items-center justify-between border-y border-border-hairline py-4 lg:hidden"
      >
        <span className="text-caption uppercase tracking-[0.14em] text-text-secondary">
          {mobileOpen ? 'Hide' : 'Show'} order ({count} {count === 1 ? 'item' : 'items'})
        </span>
        <span className="flex items-center gap-3">
          <span className="text-body-lg font-medium text-text-primary nums-tabular">
            {formatUSD(sub)}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-fast ease-standard',
              mobileOpen && 'rotate-180',
            )}
            strokeWidth={1.5}
          />
        </span>
      </button>

      <div
        className={cn(
          'overflow-hidden lg:block',
          mobileOpen ? 'block' : 'hidden',
        )}
      >
        <div className="border border-border-hairline bg-bg-canvas p-6 md:p-8 lg:p-8">
          <h2 className="eyebrow mb-5 text-text-secondary lg:block">Order Summary</h2>

          <ul className="mb-6 divide-y divide-border-hairline">
            {items.map((it) => {
              const variantLabel = [it.variant.size, it.variant.color]
                .filter(Boolean)
                .join(' · ');
              return (
                <li key={it.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-bg-muted">
                    <Image src={it.image} alt={it.name} fill sizes="64px" className="object-cover" />
                    <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-text-primary text-[10px] font-medium text-bg-canvas">
                      {it.quantity}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="truncate text-caption font-medium text-text-primary">{it.name}</p>
                    {variantLabel && (
                      <p className="text-caption text-text-muted">{variantLabel}</p>
                    )}
                  </div>
                  <p className="text-caption font-medium text-text-primary nums-tabular">
                    {formatUSD(it.price * it.quantity)}
                  </p>
                </li>
              );
            })}
          </ul>

          <CartSummary subtotal={sub} />

          <div className="mt-6 flex items-center gap-2 border-t border-border-hairline pt-5 text-caption text-text-muted">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
            Secure, encrypted checkout.
          </div>
        </div>
      </div>
    </aside>
  );
}
