// Locked taxonomy. Mirrors .claude/rules/01-product-brief.md exactly.
// Single source of truth for collection routing, breadcrumbs, and lookups.

export type Audience = 'women' | 'men' | 'kids';

export interface SubcategoryNode {
  slug: string;
  label: string;
}

export interface CategoryNode {
  slug: string;
  label: string;
  subcategories: SubcategoryNode[];
}

export interface AudienceNode {
  slug: Audience;
  label: string;
  tagline: string;
  description: string;
  heroImage: string;
  categories: CategoryNode[];
}

export const taxonomy: Record<Audience, AudienceNode> = {
  women: {
    slug: 'women',
    label: 'Women',
    tagline: 'The Atelier',
    description:
      'Hand-embroidered sarees, kurthis, and lehengas — sourced and finished with care for the modern wardrobe.',
    heroImage:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85',
    categories: [
      {
        slug: 'kurthis',
        label: 'Kurthis',
        subcategories: [
          { slug: 'kurthi-pant-dupatta', label: 'Kurthi / Pant / Dupatta' },
          { slug: 'top-with-dupatta', label: 'Only Top with Dupatta' },
          { slug: 'only-kurthi', label: 'Only Kurthi' },
        ],
      },
      { slug: 'salwar-suit', label: 'Salwar Suit', subcategories: [] },
      {
        slug: 'sarees',
        label: 'Sarees',
        subcategories: [
          { slug: 'stitched-blouse', label: 'Sarees with Stitched Blouse' },
          { slug: 'unstitched-blouse', label: 'Sarees with Unstitched Blouse' },
        ],
      },
      { slug: 'lehenga', label: 'Lehenga', subcategories: [] },
      { slug: 'readymade-blouse', label: 'Readymade Blouse', subcategories: [] },
    ],
  },
  men: {
    slug: 'men',
    label: 'Men',
    tagline: 'Heritage Tailoring',
    description:
      'Cotton kurthas, festive sets, and considered essentials cut for the modern silhouette.',
    heroImage:
      'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=2000&q=85',
    categories: [
      { slug: 'kurtha', label: 'Kurtha', subcategories: [] },
      { slug: 'kurtha-pyjama', label: 'Kurtha / Pyjama', subcategories: [] },
      { slug: 'shirts', label: 'Shirts', subcategories: [] },
      { slug: 'dhoti', label: 'Dhoti', subcategories: [] },
    ],
  },
  kids: {
    slug: 'kids',
    label: 'Kids',
    tagline: 'Festive Little Ones',
    description:
      'Soft cottons, easy fits, and festive sets crafted for everyday celebration.',
    heroImage:
      'https://images.unsplash.com/photo-1503944168849-8bf86875b08e?auto=format&fit=crop&w=2000&q=85',
    categories: [
      {
        slug: 'kurthis',
        label: 'Kurthis',
        subcategories: [
          { slug: 'only-kurthi', label: 'Only Kurthi' },
          { slug: 'kurthi-set', label: 'Kurthi Set' },
        ],
      },
      { slug: 'salwar-suit', label: 'Salwar Suit', subcategories: [] },
    ],
  },
};

export const audiences: Audience[] = ['women', 'men', 'kids'];

export function getAudience(slug: string): AudienceNode | null {
  return taxonomy[slug as Audience] ?? null;
}

export function getCategory(
  audience: Audience,
  categorySlug: string,
): CategoryNode | null {
  return (
    taxonomy[audience].categories.find((c) => c.slug === categorySlug) ?? null
  );
}

export function getSubcategory(
  audience: Audience,
  categorySlug: string,
  subSlug: string,
): SubcategoryNode | null {
  const cat = getCategory(audience, categorySlug);
  if (!cat) return null;
  return cat.subcategories.find((s) => s.slug === subSlug) ?? null;
}
