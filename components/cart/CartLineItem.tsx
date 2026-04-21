'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { CartLineItem as CartLineItemType } from '@/lib/cart/types';
import { useCart } from '@/lib/cart/store';
import { Price } from '@/components/pdp/Price';
import { cn } from '@/lib/utils/cn';
import { QuantitySelector } from './QuantitySelector';

interface CartLineItemProps {
  item: CartLineItemType;
  variant?: 'compact' | 'expanded';
  onNavigate?: () => void;
}

export function CartLineItem({
  item,
  variant = 'compact',
  onNavigate,
}: CartLineItemProps) {
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);

  const variantLabel = [item.variant.size, item.variant.color]
    .filter(Boolean)
    .join(' · ');

  const isExpanded = variant === 'expanded';

  return (
    <div
      className={cn(
        'flex gap-4',
        isExpanded ? 'py-6 md:gap-6' : 'py-5',
      )}
    >
      <Link
        href={`/p/${item.slug}`}
        onClick={onNavigate}
        className={cn(
          'relative block flex-shrink-0 overflow-hidden bg-bg-muted',
          isExpanded ? 'h-32 w-24 md:h-36 md:w-28' : 'h-[110px] w-[88px]',
        )}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="120px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/p/${item.slug}`}
              onClick={onNavigate}
              className="block text-body font-medium text-text-primary line-clamp-2 transition-colors duration-fast ease-standard hover:text-accent-ember"
            >
              {item.name}
            </Link>
            {variantLabel && (
              <p className="mt-1 text-caption text-text-muted">{variantLabel}</p>
            )}
            {!isExpanded && (
              <div className="mt-2">
                <Price price={item.price} size="sm" />
              </div>
            )}
          </div>

          {isExpanded && (
            <Price
              price={item.price * item.quantity}
              originalPrice={
                item.originalPrice ? item.originalPrice * item.quantity : undefined
              }
              size="md"
            />
          )}

          {!isExpanded && (
            <button
              type="button"
              aria-label={`Remove ${item.name}`}
              onClick={() => remove(item.id)}
              className="flex h-9 w-9 items-center justify-center text-text-muted transition-colors duration-fast ease-standard hover:text-accent-crimson"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <QuantitySelector
            value={item.quantity}
            onChange={(q) => updateQty(item.id, q)}
          />
          {isExpanded && (
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="text-caption text-text-muted underline underline-offset-4 transition-colors duration-fast ease-standard hover:text-accent-crimson"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
