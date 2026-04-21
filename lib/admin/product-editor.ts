/**
 * Placeholder product editor data layer.
 *
 * This is intentionally a small, typed, in-memory shape that mirrors what a
 * real Supabase-backed product record will eventually look like. The admin
 * editor UI consumes this shape through local React state only — there is
 * no persistence, no fetching, no mutation API.
 *
 * When Step 10+ wires Supabase, replace the functions in this file with
 * real server actions / loaders. The UI components should not need to
 * change because they only depend on the `EditableProduct` type.
 */

import { products } from '@/lib/catalog/products';
import type { Audience } from '@/lib/catalog/taxonomy';

export type ProductStatus = 'draft' | 'active' | 'archived';
export type AmazonListingStatus =
  | 'draft'
  | 'pending'
  | 'listed'
  | 'error'
  | 'suppressed';

export interface EditableVariant {
  /** Client-side uid — stable during a session. */
  uid: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price: number;
  salePrice?: number | null;
}

export interface EditableMedia {
  /** Client-side uid — stable during a session. */
  uid: string;
  url: string;
  alt: string;
  isCover: boolean;
}

export interface EditableSeo {
  slug: string;
  metaTitle: string;
  metaDescription: string;
}

export interface EditableFlags {
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  tryOnEnabled: boolean;
}

export interface EditableChannel {
  publishToAmazon: boolean;
  amazonSku: string;
  asin: string;
  listingStatus: AmazonListingStatus;
  lastSyncAt?: string | null;
  lastSyncError?: string | null;
}

export interface EditableProduct {
  id: string;
  status: ProductStatus;
  name: string;
  description: string;
  fabric: string;
  care: string;
  audience: Audience;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number | null;
  variants: EditableVariant[];
  media: EditableMedia[];
  seo: EditableSeo;
  flags: EditableFlags;
  channel: EditableChannel;
}

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

let _uidSeq = 0;
export function makeUid(prefix = 'u'): string {
  _uidSeq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_uidSeq}`;
}

export function makeEmptyVariant(overrides: Partial<EditableVariant> = {}): EditableVariant {
  return {
    uid: makeUid('v'),
    size: '',
    color: '',
    sku: '',
    stock: 0,
    price: 0,
    salePrice: null,
    ...overrides,
  };
}

export function makeEmptyMedia(overrides: Partial<EditableMedia> = {}): EditableMedia {
  return {
    uid: makeUid('m'),
    url: '',
    alt: '',
    isCover: false,
    ...overrides,
  };
}

/**
 * Blank editor state used by `/admin/products/new`. Pre-seeded with a single
 * empty variant and empty SEO so the editor feels alive rather than empty.
 */
export function makeEmptyEditableProduct(): EditableProduct {
  return {
    id: makeUid('p'),
    status: 'draft',
    name: '',
    description: '',
    fabric: '',
    care: '',
    audience: 'women',
    category: 'kurthis',
    subcategory: undefined,
    price: 0,
    originalPrice: null,
    variants: [makeEmptyVariant()],
    media: [],
    seo: {
      slug: '',
      metaTitle: '',
      metaDescription: '',
    },
    flags: {
      featured: false,
      bestSeller: false,
      newArrival: true,
      tryOnEnabled: false,
    },
    channel: {
      publishToAmazon: false,
      amazonSku: '',
      asin: '',
      listingStatus: 'draft',
      lastSyncAt: null,
      lastSyncError: null,
    },
  };
}

/**
 * Build a believable editor state from an existing catalog product. Used by
 * `/admin/products/[id]` for the edit flow. Derives fake variant/media rows
 * from the product's `sizes` and `colors` arrays so the editor feels loaded.
 */
export function toEditableProduct(slugOrId: string): EditableProduct | null {
  const source = products.find((p) => p.slug === slugOrId || p.id === slugOrId);
  if (!source) return null;

  const sizes = source.sizes.length ? source.sizes : ['One Size'];
  const colors = source.colors.length ? source.colors : ['Default'];

  const variants: EditableVariant[] = [];
  sizes.forEach((size, i) => {
    colors.forEach((color, j) => {
      variants.push({
        uid: `v_${source.id}_${i}_${j}`,
        size,
        color,
        sku: `${source.id.toUpperCase()}-${size.replace(/\s+/g, '')}-${color.slice(0, 3).toUpperCase()}`,
        stock: source.inStock ? 6 + ((i + j) % 8) : 0,
        price: source.price,
        salePrice: source.originalPrice ? source.price : null,
      });
    });
  });

  const media: EditableMedia[] = [
    {
      uid: `m_${source.id}_cover`,
      url: source.image,
      alt: source.name,
      isCover: true,
    },
    {
      uid: `m_${source.id}_alt1`,
      url: source.image,
      alt: `${source.name} — detail`,
      isCover: false,
    },
    {
      uid: `m_${source.id}_alt2`,
      url: source.image,
      alt: `${source.name} — styled`,
      isCover: false,
    },
  ];

  return {
    id: source.id,
    status: 'active',
    name: source.name,
    description:
      'Hand-finished in small batches. Cut from breathable fabrics and trimmed with traditional detailing — a quiet, considered piece for everyday celebration.',
    fabric: source.fabric,
    care: 'Dry clean recommended. Store folded in a cool, dry place.',
    audience: source.audience,
    category: source.category,
    subcategory: source.subcategory,
    price: source.price,
    originalPrice: source.originalPrice ?? null,
    variants,
    media,
    seo: {
      slug: source.slug,
      metaTitle: `${source.name} · Sakthi Trends USA`,
      metaDescription: `Shop ${source.name} — premium ${source.fabric.toLowerCase()} finishing from Sakthi Trends USA.`,
    },
    flags: {
      featured: source.badge === 'Best Seller',
      bestSeller: source.badge === 'Best Seller',
      newArrival: source.badge === 'New',
      tryOnEnabled: source.audience !== 'kids',
    },
    channel: {
      publishToAmazon: source.audience === 'women',
      amazonSku: `AMZ-${source.id.toUpperCase()}`,
      asin: source.audience === 'women' ? 'B0CXX1234Z' : '',
      listingStatus: source.audience === 'women' ? 'listed' : 'draft',
      lastSyncAt: source.audience === 'women' ? '2h ago' : null,
      lastSyncError: null,
    },
  };
}
