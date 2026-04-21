'use client';

import { useState } from 'react';
import { Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import type { ProductDetails } from '@/lib/catalog/product-details';
import { cn } from '@/lib/utils/cn';
import { Price } from './Price';
import { VariantPicker } from './VariantPicker';
import { SizeGuideDialog } from './SizeGuideDialog';

interface PurchasePanelProps {
  product: ProductDetails;
  eyebrow: string;
}

/**
 * Owns selection state (size/color), size-guide open state, and the no-op
 * add-to-cart / wishlist shells. Renders the desktop purchase panel plus a
 * minimal mobile sticky bar (one primary action).
 */
export function PurchasePanel({ product, eyebrow }: PurchasePanelProps) {
  const soldOut = !product.inStock;
  const hasSizes = product.sizes.length > 0 && product.sizes[0] !== 'Free Size';

  const [size, setSize] = useState<string | null>(
    !hasSizes ? product.sizes[0] ?? null : null,
  );
  const [color, setColor] = useState<string | null>(
    product.colors.length === 1 ? product.colors[0] : null,
  );
  const [sizeError, setSizeError] = useState<string | undefined>();
  const [wishlisted, setWishlisted] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  function handleAdd() {
    if (soldOut) return;
    if (hasSizes && !size) {
      setSizeError('Please select a size.');
      return;
    }
    setSizeError(undefined);
    // No-op shell — real cart wiring lands in Step 7.
  }

  const ctaLabel = soldOut ? 'Sold Out' : 'Add to Cart';

  return (
    <>
      <div className="flex flex-col gap-8">
        <header>
          <p className="eyebrow text-accent-ember">
            {soldOut ? 'Sold Out' : eyebrow}
          </p>
          <h1 className="mt-3 text-h2 font-medium text-text-primary md:text-h1">
            {product.name}
          </h1>
          <div className="mt-4">
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
              size="lg"
            />
          </div>
          <p className="mt-4 text-body text-text-secondary">
            {product.shortDescription}
          </p>
        </header>

        {product.colors.length > 1 && (
          <VariantPicker
            idPrefix="color"
            label="Color"
            options={product.colors}
            value={color}
            onChange={setColor}
          />
        )}

        {hasSizes && (
          <VariantPicker
            idPrefix="size"
            label="Size"
            options={product.sizes}
            value={size}
            onChange={(v) => {
              setSize(v);
              setSizeError(undefined);
            }}
            error={sizeError}
            rightSlot={
              product.sizeGuide.rows.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="text-caption text-text-secondary underline underline-offset-4 transition-colors duration-fast ease-standard hover:text-text-primary"
                >
                  Size guide
                </button>
              ) : null
            }
          />
        )}

        <div className="flex items-stretch gap-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className={cn(
              'flex-1 bg-text-primary px-6 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas transition-opacity duration-fast ease-standard',
              'min-h-[52px]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2',
              soldOut
                ? 'cursor-not-allowed opacity-40'
                : 'hover:opacity-90',
            )}
          >
            {ctaLabel}
          </button>
          <button
            type="button"
            onClick={() => setWishlisted((v) => !v)}
            aria-pressed={wishlisted}
            aria-label="Save to wishlist"
            className="flex min-h-[52px] w-[52px] items-center justify-center border border-border-hairline text-text-primary transition-colors duration-fast ease-standard hover:border-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ember focus-visible:ring-offset-2"
          >
            <Heart
              className={cn('h-5 w-5', wishlisted && 'fill-accent-crimson text-accent-crimson')}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <ul className="grid grid-cols-1 gap-3 border-t border-border-hairline pt-6 text-caption text-text-secondary sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
            Free US shipping $150+
          </li>
          <li className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
            14-day easy returns
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
            Secure checkout
          </li>
        </ul>
      </div>

      {/* Mobile sticky CTA bar — quiet, premium, single primary action */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border-hairline bg-bg-canvas/95 backdrop-blur lg:hidden',
          'pb-[env(safe-area-inset-bottom)]',
        )}
      >
        <div className="flex items-center gap-4 px-5 py-3">
          <div className="min-w-0 flex-1">
            <Price price={product.price} originalPrice={product.originalPrice} size="sm" />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className={cn(
              'flex min-h-[48px] flex-1 items-center justify-center bg-text-primary px-5 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas',
              soldOut ? 'cursor-not-allowed opacity-40' : 'hover:opacity-90',
            )}
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      <SizeGuideDialog
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        note={product.sizeGuide.note}
        rows={product.sizeGuide.rows}
      />
    </>
  );
}
