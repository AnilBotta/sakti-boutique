/**
 * Helpers for scoping a flat FieldError[] to per-section subsets
 * for the admin product editor cards.
 */

import type { FieldError } from '@/lib/validation/product';

/**
 * Filter errors whose path starts with the given prefix.
 * - "name" matches "name" exactly (and "name.first" etc.)
 * - "variants" matches "variants.0.sku", "variants.1.price", ...
 * - "seo" matches "seo.slug", "seo.metaTitle", ...
 */
export function scopeErrors(errors: FieldError[], prefix: string): FieldError[] {
  return errors.filter(
    (e) => e.path === prefix || e.path.startsWith(`${prefix}.`),
  );
}

/**
 * Filter errors that exactly match one of the given paths.
 * Useful for picking out specific fields inside a card (e.g. `name` vs `description`).
 */
export function pickErrors(errors: FieldError[], paths: string[]): FieldError[] {
  return errors.filter((e) => paths.includes(e.path));
}

/** First error message for a specific path, or undefined. */
export function errorFor(
  errors: FieldError[] | null | undefined,
  path: string,
): string | undefined {
  if (!errors) return undefined;
  return errors.find((e) => e.path === path)?.message;
}

/** First error message whose path starts with the given prefix, or undefined. */
export function firstErrorWithPrefix(
  errors: FieldError[] | null | undefined,
  prefix: string,
): string | undefined {
  if (!errors) return undefined;
  return errors.find((e) => e.path === prefix || e.path.startsWith(`${prefix}.`))
    ?.message;
}

interface SectionConfig {
  label: string;
  prefix: string;
}

/**
 * Build a friendly summary like "Variants, SEO slug" given the failing fields.
 * Used for the top-of-form banner so operators see which sections need
 * attention at a glance.
 */
export function summarizeErrorSections(
  errors: FieldError[],
  sections: SectionConfig[] = DEFAULT_SECTIONS,
): string[] {
  const hits = new Set<string>();
  for (const e of errors) {
    for (const s of sections) {
      if (e.path === s.prefix || e.path.startsWith(`${s.prefix}.`)) {
        hits.add(s.label);
      }
    }
  }
  return Array.from(hits);
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { label: 'Basic info', prefix: 'name' },
  { label: 'Description', prefix: 'description' },
  { label: 'Pricing', prefix: 'price' },
  { label: 'Compare-at price', prefix: 'originalPrice' },
  { label: 'Variants', prefix: 'variants' },
  { label: 'Media', prefix: 'media' },
  { label: 'SEO', prefix: 'seo' },
  { label: 'Amazon channel', prefix: 'channel' },
];
