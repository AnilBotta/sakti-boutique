import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/catalog/products';
import { cn } from '@/lib/utils/cn';

interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * Shared product card. Used by homepage rails and all collection grids.
 * Server component — wishlist button is a leaf interaction added in a later step.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const href = `/p/${product.slug}`;

  return (
    <Link href={href} className={cn('group block', className)}>
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={cn(
            'object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.03]',
            !product.inStock && 'opacity-80',
          )}
        />
        {/* Hover scrim — adds depth on desktop without obscuring the garment */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-base ease-standard group-hover:opacity-100"
        />

        {product.badge && product.inStock && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-sm border border-border-hairline bg-bg-canvas px-2.5 py-1 text-eyebrow font-medium uppercase tracking-[0.14em] text-accent-ember">
            {product.badge}
          </span>
        )}

        {!product.inStock && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-sm border border-border-hairline bg-bg-canvas px-2.5 py-1 text-eyebrow font-medium uppercase tracking-[0.14em] text-text-secondary">
            Sold Out
          </span>
        )}

        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-bg-canvas/90 text-text-primary shadow-rest transition-all duration-fast ease-standard hover:scale-110 hover:text-accent-crimson active:scale-95"
        >
          <Heart className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="pt-4 pb-1">
        <h3 className="text-body font-medium text-text-primary line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2 nums-tabular">
          <span className="text-body font-medium text-text-primary">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-caption text-text-muted line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
