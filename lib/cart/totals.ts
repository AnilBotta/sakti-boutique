import type { CartLineItem } from './types';

export function subtotal(items: CartLineItem[]): number {
  return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
}

export function itemCount(items: CartLineItem[]): number {
  return items.reduce((sum, it) => sum + it.quantity, 0);
}

export function formatUSD(cents: number): string {
  // Values are whole USD for the shell; keep formatting simple.
  return `$${cents.toFixed(0)}`;
}
