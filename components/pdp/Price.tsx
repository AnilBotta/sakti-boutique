import { cn } from '@/lib/utils/cn';

interface PriceProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Small, purpose-specific price row. Used on the PDP purchase panel and the
 * mobile sticky bar. Intentionally NOT a catalog-wide pricing system.
 */
export function Price({ price, originalPrice, size = 'md', className }: PriceProps) {
  const priceClass =
    size === 'lg'
      ? 'text-[1.5rem] leading-none'
      : size === 'sm'
        ? 'text-body'
        : 'text-body-lg';
  const strikeClass = size === 'lg' ? 'text-body' : 'text-caption';

  return (
    <div
      className={cn('flex items-baseline gap-3 nums-tabular', className)}
      aria-label={`Price ${price} US dollars`}
    >
      <span className={cn('font-medium text-text-primary', priceClass)}>
        ${price}
      </span>
      {originalPrice && originalPrice > price && (
        <span className={cn('text-text-muted line-through', strikeClass)}>
          ${originalPrice}
        </span>
      )}
    </div>
  );
}
