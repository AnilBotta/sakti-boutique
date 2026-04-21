// PDP enrichment layer.
// Wraps base Product fixtures with rich content (gallery, descriptions, care,
// try-on flag, size guide) without touching every entry by hand.
// When Supabase wires in, swap `enrichProduct` for a real query.

import type { Product } from './products';
import { products } from './products';

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

export function enrichProduct(p: Product): ProductDetails {
  const { short, full } = describe(p);
  const sizeRows =
    p.audience === 'women'
      ? womenSizeRows.filter((r) => p.sizes.includes(r.size))
      : p.audience === 'men'
        ? menSizeRows.filter((r) => p.sizes.includes(r.size))
        : kidsSizeRows.filter((r) => p.sizes.includes(r.size));

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
    images: [p.image, p.image, p.image, p.image],
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

export function getProductDetails(slug: string): ProductDetails | null {
  const base = products.find((p) => p.slug === slug);
  return base ? enrichProduct(base) : null;
}

export function getRelatedProducts(p: Product, limit = 4): Product[] {
  return products
    .filter(
      (other) =>
        other.id !== p.id &&
        other.audience === p.audience &&
        other.category === p.category,
    )
    .slice(0, limit);
}
