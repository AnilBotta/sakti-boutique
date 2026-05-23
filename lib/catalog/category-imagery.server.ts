/**
 * CMS-aware async resolvers for category banner imagery.
 *
 * Server-only — kept in its own file so client components consuming the
 * sync `categoryImage()` from `category-imagery.ts` aren't transitively
 * pulled into a server bundle.
 */

import 'server-only';

import {
  listSiteImages,
  type SiteImageSlot,
} from '@/lib/repositories/site-imagery';
import { categoryImage } from './category-imagery';

const CATEGORY_SLOTS = new Set<string>([
  'category_women_kurthis',
  'category_women_salwar_suit',
  'category_women_sarees',
  'category_women_lehenga',
  'category_women_readymade_blouse',
  'category_men_kurtha',
  'category_men_kurtha_pyjama',
  'category_men_shirts',
  'category_men_dhoti',
  'category_kids_kurthis',
  'category_kids_salwar_suit',
]);

// Women-specific homepage "Featured silhouettes" slots (PR #16). Used as a
// secondary fallback for the audience-landing rail so a single upload from
// the operator's perspective populates BOTH the homepage tile and the
// /women rail. Without this, the operator would have to upload to two
// different slots to fill the same-looking section in two places.
const WOMEN_FEATURED_SLOTS = new Set<string>([
  'women_featured_kurthis',
  'women_featured_salwar_suit',
  'women_featured_sarees',
  'women_featured_lehenga',
  'women_featured_readymade_blouse',
]);

/**
 * Build the `site_imagery` slot key for a given category. Hyphens in slugs
 * become underscores so the slot string matches the registered enum.
 */
function slotForCategory(
  audience: string,
  category: string,
): SiteImageSlot | null {
  const slot = `category_${audience}_${category.replace(/-/g, '_')}`;
  if (!CATEGORY_SLOTS.has(slot)) return null;
  return slot as SiteImageSlot;
}

/**
 * Secondary fallback slot. Currently only Women has a homepage
 * "Featured silhouettes" rail with its own slot set — reuse those when
 * the more-specific category banner slot is empty.
 */
function fallbackSlotForCategory(
  audience: string,
  category: string,
): SiteImageSlot | null {
  if (audience !== 'women') return null;
  const slot = `women_featured_${category.replace(/-/g, '_')}`;
  if (!WOMEN_FEATURED_SLOTS.has(slot)) return null;
  return slot as SiteImageSlot;
}

export interface ResolvedCategoryImage {
  src: string;
  alt: string;
  /** True when the image comes from an admin upload (not the hardcoded fallback). */
  uploaded: boolean;
}

/**
 * Single-category resolution. Useful when a page only needs one banner.
 *
 * Resolution order:
 *   1. `category_<audience>_<slug>` (the canonical category banner slot)
 *   2. `<audience>_featured_<slug>` (only for women — falls back to the
 *      homepage "Featured silhouettes" upload so one upload populates both)
 *   3. The hardcoded fallback URL.
 */
export async function getCategoryBannerImage(
  audience: string,
  category: string,
  fallbackAlt = '',
): Promise<ResolvedCategoryImage> {
  const fallback: ResolvedCategoryImage = {
    src: categoryImage(audience, category),
    alt: fallbackAlt,
    uploaded: false,
  };
  const primary = slotForCategory(audience, category);
  const secondary = fallbackSlotForCategory(audience, category);
  const toQuery: SiteImageSlot[] = [primary, secondary].filter(
    (s): s is SiteImageSlot => !!s,
  );
  if (toQuery.length === 0) return fallback;
  const all = await listSiteImages(toQuery);
  const primaryRow = primary ? all[primary] : null;
  const secondaryRow = secondary ? all[secondary] : null;
  const winner = primaryRow?.url ? primaryRow : secondaryRow;
  if (!winner?.url) return fallback;
  return {
    src: winner.url,
    alt: winner.alt ?? fallbackAlt,
    uploaded: true,
  };
}

/**
 * Batch resolution for an audience landing page that renders all of its
 * category tiles in one go. Returns a map keyed by category slug.
 *
 * Each tile resolves via the same order as `getCategoryBannerImage`:
 * canonical category banner → women-featured fallback → hardcoded URL.
 * Both slot sets are fetched in a single round-trip.
 */
export async function listCategoryBannerImages(
  audience: string,
  categories: { slug: string; label: string }[],
): Promise<Record<string, ResolvedCategoryImage>> {
  const primaryByCategory = new Map<string, SiteImageSlot>();
  const secondaryByCategory = new Map<string, SiteImageSlot>();
  for (const c of categories) {
    const p = slotForCategory(audience, c.slug);
    if (p) primaryByCategory.set(c.slug, p);
    const s = fallbackSlotForCategory(audience, c.slug);
    if (s) secondaryByCategory.set(c.slug, s);
  }
  const allSlots = Array.from(
    new Set<SiteImageSlot>([
      ...primaryByCategory.values(),
      ...secondaryByCategory.values(),
    ]),
  );
  const live = allSlots.length ? await listSiteImages(allSlots) : null;

  const out: Record<string, ResolvedCategoryImage> = {};
  for (const c of categories) {
    const primary = primaryByCategory.get(c.slug);
    const secondary = secondaryByCategory.get(c.slug);
    const primaryRow = primary && live ? live[primary] : null;
    const secondaryRow = secondary && live ? live[secondary] : null;
    const winner = primaryRow?.url ? primaryRow : secondaryRow;
    if (winner?.url) {
      out[c.slug] = {
        src: winner.url,
        alt: winner.alt ?? c.label,
        uploaded: true,
      };
    } else {
      out[c.slug] = {
        src: categoryImage(audience, c.slug),
        alt: c.label,
        uploaded: false,
      };
    }
  }
  return out;
}
