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

export interface ResolvedCategoryImage {
  src: string;
  alt: string;
  /** True when the image comes from an admin upload (not the hardcoded fallback). */
  uploaded: boolean;
}

/**
 * Single-category resolution. Useful when a page only needs one banner.
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
  const slot = slotForCategory(audience, category);
  if (!slot) return fallback;
  const all = await listSiteImages([slot]);
  const live = all[slot];
  if (!live?.url) return fallback;
  return { src: live.url, alt: live.alt ?? fallbackAlt, uploaded: true };
}

/**
 * Batch resolution for an audience landing page that renders all of its
 * category tiles in one go. Returns a map keyed by category slug.
 */
export async function listCategoryBannerImages(
  audience: string,
  categories: { slug: string; label: string }[],
): Promise<Record<string, ResolvedCategoryImage>> {
  const slotByCategory = new Map<string, SiteImageSlot>();
  for (const c of categories) {
    const s = slotForCategory(audience, c.slug);
    if (s) slotByCategory.set(c.slug, s);
  }
  const slots = Array.from(slotByCategory.values());
  const live = slots.length ? await listSiteImages(slots) : null;

  const out: Record<string, ResolvedCategoryImage> = {};
  for (const c of categories) {
    const slot = slotByCategory.get(c.slug);
    const liveRow = slot && live ? live[slot] : null;
    if (liveRow?.url) {
      out[c.slug] = {
        src: liveRow.url,
        alt: liveRow.alt ?? c.label,
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
