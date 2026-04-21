'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useCart, selectSubtotal, selectItemCount } from '@/lib/cart/store';
import { formatUSD } from '@/lib/cart/totals';
import { cn } from '@/lib/utils/cn';
import { CartLineItem } from './CartLineItem';
import { EmptyCartState } from './EmptyCartState';

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const sub = useCart(selectSubtotal);
  const count = useCart(selectItemCount);
  // Body scroll lock + ESC close
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        'fixed inset-0 z-50',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        className={cn(
          'absolute inset-0 bg-[rgba(15,15,15,0.4)] transition-opacity duration-fast ease-standard',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Sheet */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={cn(
          'absolute right-0 top-0 flex h-full w-[88vw] max-w-[440px] flex-col bg-bg-canvas shadow-float',
          'transition-transform duration-base ease-standard',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border-hairline px-5">
          <div>
            <h2
              id="cart-drawer-title"
              className="text-body-lg font-medium text-text-primary"
            >
              Your Cart
            </h2>
            {count > 0 && (
              <p className="text-caption text-text-muted">
                {count} {count === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="flex h-11 w-11 items-center justify-center text-text-secondary transition-colors duration-fast ease-standard hover:text-text-primary"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyCartState variant="drawer" onAction={close} />
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-border-hairline overflow-y-auto px-5">
              {items.map((it) => (
                <CartLineItem key={it.id} item={it} onNavigate={close} />
              ))}
            </div>

            {/* Footer */}
            <footer className="flex-shrink-0 border-t border-border-hairline bg-bg-canvas px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="eyebrow text-text-secondary">Subtotal</span>
                <span className="text-body-lg font-medium text-text-primary nums-tabular">
                  {formatUSD(sub)}
                </span>
              </div>
              <p className="mb-4 text-caption text-text-muted">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={close}
                  className="flex min-h-[52px] items-center justify-center bg-text-primary px-5 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={close}
                  className="flex min-h-[44px] items-center justify-center text-caption uppercase tracking-[0.14em] text-text-secondary underline underline-offset-4 transition-colors duration-fast ease-standard hover:text-text-primary"
                >
                  View full cart
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
