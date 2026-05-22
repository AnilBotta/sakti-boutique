// PDP enrichment layer.
// Wraps a base Product (sourced from live Supabase) with rich content
// (gallery, descriptions, care, try-on flag, size guide). The base record
// itself comes from `lib/repositories/catalog.ts`.

import type { Product } from './products';
import {
  getProductBySlug,
  listProductImages,
  listRelatedProducts,
} from '@/lib/repositories/catalog';

export interface SizeGuideRow {
  size: string;
  bust: string;
  waist: string;
  hip: string;
}

export interface ProductDetails extends Product {
  shortDescription: string;
  fullDescription: string;
  careInstructions: string[];
  shippingSummary: string;
  returnSummary: string;
  images: string[];
  sizeGuide: {
    note: string;
    rows: SizeGuideRow[];
  };
  tryOnEligible: boolean;
}

const fabricCareMap: Record<string, string[]> = {
  Cotton: [
    'Hand wash cold with mild detergent.',
    'Dry in shade. Iron on medium heat.',
    'Do not bleach.',
  ],
  Silk: [
    'Dry clean only to preserve sheen and embroidery.',
    'Store folded with acid-free tissue.',
    'Avoid direct sunlight when storing.',
  ],
  'Banarasi Silk': [
    'Dry clean only.',
    'Wrap in muslin between wears.',
    'Avoid contact with perfumes and deodorants.',
  ],
  Organza: [
    'Dry clean only.',
    'Iron on the lowest heat with a press cloth.',
    'Store hanging to retain shape.',
  ],
  Georgette: [
    'Dry clean recommended.',
    'Iron on low heat through a cotton cloth.',
  ],
  Linen: [
    'Machine wash cold on gentle cycle.',
    'Line dry. Iron while slightly damp.',
  ],
};

const womenSizeRows: SizeGuideRow[] = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '35"' },
  { size: 'S',  bust: '34"', waist: '28"', hip: '37"' },
  { size: 'M',  bust: '36"', waist: '30"', hip: '39"' },
  { size: 'L',  bust: '38"', waist: '32"', hip: '41"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '43"' },
];

const menSizeRows: SizeGuideRow[] = [
  { size: 'S',  bust: '38"', waist: '32"', hip: '38"' },
  { size: 'M',  bust: '40"', waist: '34"', hip: '40"' },
  { size: 'L',  bust: '42"', waist: '36"', hip: '42"' },
  { size: 'XL', bust: '44"', waist: '38"', hip: '44"' },
];

const kidsSizeRows: SizeGuideRow[] = [
  { size: '2-3Y', bust: '21"', waist: '20"', hip: '22"' },
  { size: '4-5Y', bust: '23"', waist: '21"', hip: '24"' },
  { size: '6-7Y', bust: '25"', waist: '22"', hip: '26"' },
  { size: '8-9Y', bust: '27"', waist: '23"', hip: '28"' },
];

function describe(p: Product): { short: string; full: string } {
  const fabric = p.fabric.toLowerCase();
  const occasion =
    p.occasion[0]?.toLowerCase() === 'wedding'
      ? 'wedding-ready'
      : p.occasion[0]?.toLowerCase() === 'festive'
        ? 'festive'
        : 'everyday';
  const short = `A ${occasion} ${fabric} piece, hand-finished in our atelier.`;
  const full = `${p.name} is crafted from soft ${fabric} and finished by hand in our atelier. Designed for the modern wardrobe yet rooted in tradition, this piece carries the quiet detail and considered tailoring Sakthi is known for. Wear it for ${p.occasion.join(', ').toLowerCase()} moments — and the everyday in between.`;
  return { short, full };
}

export function enrichProduct(
  p: Product,
  galleryImages?: string[],
): ProductDetails {
  const { short, full } = describe(p);
  const sizeRows =
    p.audience === 'women'
      ? womenSizeRows.filter((r) => p.sizes.includes(r.size))
      : p.audience === 'men'
        ? menSizeRows.filter((r) => p.sizes.includes(r.size))
        : kidsSizeRows.filter((r) => p.sizes.includes(r.size));

  // Real gallery from product_images table. Falls back to the cover URL
  // (single image, not the old 4x repetition) when no images are returned —
  // happens for legacy products that only have a single cover.
  const images =
    galleryImages && galleryImages.length > 0
      ? galleryImages
      : p.image
        ? [p.image]
        : [];

  return {
    ...p,
    shortDescription: short,
    fullDescription: full,
    careInstructions:
      fabricCareMap[p.fabric] ??
      ['Dry clean recommended for best longevity.', 'Store flat in a cool, dry place.'],
    shippingSummary:
      'Complimentary US shipping on orders over $150. Standard delivery in 3–5 business days.',
    returnSummary: '14-day easy returns. Items must be unworn with tags attached.',
    images,
    sizeGuide: {
      note:
        sizeRows.length > 0
          ? 'Measurements are body measurements in inches. Allow ~1 inch ease for comfort.'
          : 'This piece is offered in a single fit. Refer to product description for details.',
      rows: sizeRows,
    },
    tryOnEligible:
      p.audience === 'women' &&
      ['kurthis', 'sarees', 'lehenga', 'salwar-suit'].includes(p.category),
  };
}

export async function getProductDetails(
  slug: string,
): Promise<ProductDetails | null> {
  const base = await getProductBySlug(slug);
  if (!base) return null;
  // Fetch the full image gallery in parallel-friendly form (caller already
  // awaited the product; this second round-trip is cheap and unblocks the
  // PDP from the single-cover-only constraint).
  const images = await listProductImages(base.id);
  return enrichProduct(base, images);
}

export async function getRelatedProducts(
  p: Product,
  limit = 4,
): Promise<Product[]> {
  return listRelatedProducts(p.slug, limit);
}
