// Facet derivation + filter / sort logic. Pure functions, easy to swap for
// server-side filtering when Supabase wires in.

import type { Product } from './products';

export type SortKey = 'new' | 'price-asc' | 'price-desc' | 'best-sellers';

export interface ActiveFilters {
  priceMax?: number;
  sizes: string[];
  colors: string[];
  fabrics: string[];
  occasions: string[];
}

export const emptyFilters: ActiveFilters = {
  priceMax: undefined,
  sizes: [],
  colors: [],
  fabrics: [],
  occasions: [],
};

export interface FacetCounts {
  sizes: { value: string; count: number }[];
  colors: { value: string; count: number }[];
  fabrics: { value: string; count: number }[];
  occasions: { value: string; count: number }[];
  priceRange: { min: number; max: number };
}

export function buildFacets(products: Product[]): FacetCounts {
  const sizes = new Map<string, number>();
  const colors = new Map<string, number>();
  const fabrics = new Map<string, number>();
  const occasions = new Map<string, number>();
  let min = Infinity;
  let max = 0;

  for (const p of products) {
    p.sizes.forEach((s) => sizes.set(s, (sizes.get(s) ?? 0) + 1));
    p.colors.forEach((c) => colors.set(c, (colors.get(c) ?? 0) + 1));
    fabrics.set(p.fabric, (fabrics.get(p.fabric) ?? 0) + 1);
    p.occasion.forEach((o) => occasions.set(o, (occasions.get(o) ?? 0) + 1));
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }

  const toEntries = (m: Map<string, number>) =>
    Array.from(m.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));

  return {
    sizes: toEntries(sizes),
    colors: toEntries(colors),
    fabrics: toEntries(fabrics),
    occasions: toEntries(occasions),
    priceRange: { min: Number.isFinite(min) ? min : 0, max },
  };
}

export function applyFilters(
  products: Product[],
  filters: ActiveFilters,
): Product[] {
  return products.filter((p) => {
    if (filters.priceMax != null && p.price > filters.priceMax) return false;
    if (filters.sizes.length && !filters.sizes.some((s) => p.sizes.includes(s)))
      return false;
    if (
      filters.colors.length &&
      !filters.colors.some((c) => p.colors.includes(c))
    )
      return false;
    if (filters.fabrics.length && !filters.fabrics.includes(p.fabric))
      return false;
    if (
      filters.occasions.length &&
      !filters.occasions.some((o) => p.occasion.includes(o))
    )
      return false;
    return true;
  });
}

export function applySort(products: Product[], sort: SortKey): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price);
    case 'best-sellers':
      return arr.sort((a, b) => {
        const aBest = a.badge === 'Best Seller' ? 0 : 1;
        const bBest = b.badge === 'Best Seller' ? 0 : 1;
        return aBest - bBest;
      });
    case 'new':
    default:
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function countActive(filters: ActiveFilters): number {
  return (
    (filters.priceMax != null ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    filters.fabrics.length +
    filters.occasions.length
  );
}
