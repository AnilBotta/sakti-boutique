// DEV/DEMO ONLY. Not imported anywhere in normal storefront flow.
// Call `seedDemoCart()` manually from a dev tool or console when you need
// believable cart content for UI review. Real customers never hit this.

import { products } from '@/lib/catalog/products';
import type { CartLineItem } from './types';
import { useCart } from './store';

function lineFromSlug(
  slug: string,
  variant: { size?: string; color?: string },
  quantity: number,
): CartLineItem | null {
  const p = products.find((x) => x.slug === slug);
  if (!p) return null;
  return {
    id: `${p.id}:${variant.size ?? ''}:${variant.color ?? ''}`,
    productId: p.id,
    slug: p.slug,
    name: p.name,
    variant,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image,
    quantity,
  };
}

export function buildDemoCart(): CartLineItem[] {
  return [
    lineFromSlug('aanya-hand-embroidered-kurthi-set', { size: 'M', color: 'Saffron' }, 1),
    lineFromSlug('meera-banarasi-silk-saree', { color: 'Crimson' }, 1),
    lineFromSlug('ishaan-cotton-kurtha', { size: 'L', color: 'Ivory' }, 2),
  ].filter(Boolean) as CartLineItem[];
}

/** Explicit dev helper. Not wired to any UI. */
export function seedDemoCart() {
  const store = useCart.getState();
  store.clear();
  for (const item of buildDemoCart()) store.add(item);
}
