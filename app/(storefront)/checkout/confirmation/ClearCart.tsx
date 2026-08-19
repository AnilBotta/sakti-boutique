'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/cart/store';

/** Empties the cart once, on mount, after a successful order. */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
