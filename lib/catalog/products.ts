// Placeholder catalog. Replace with Supabase queries in a later step.
// Each product is tagged for filtering/listing across the locked taxonomy.

import type { Audience } from './taxonomy';

export type Badge = 'New' | 'Best Seller' | 'Festive';

export interface Product {
  id: string;
  slug: string;
  name: string;
  audience: Audience;
  category: string;          // category slug
  subcategory?: string;      // optional subcategory slug
  price: number;
  originalPrice?: number;
  badge?: Badge;
  image: string;
  // Filterable attributes
  sizes: string[];
  colors: string[];
  fabric: string;
  occasion: string[];
  inStock: boolean;
  createdAt: string; // ISO date — used for "New" sort
}

const img = {
  kurthi1:
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
  kurthi2:
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80',
  kurthi3:
    'https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=900&q=80',
  saree1:
    'https://images.unsplash.com/photo-1594387310467-bb8b1ba73e2e?auto=format&fit=crop&w=900&q=80',
  saree2:
    'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=900&q=80',
  lehenga1:
    'https://images.unsplash.com/photo-1610189019926-f8a4ec1cc7e3?auto=format&fit=crop&w=900&q=80',
  men1:
    'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=900&q=80',
  men2:
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80',
  kids1:
    'https://images.unsplash.com/photo-1503944168849-8bf86875b08e?auto=format&fit=crop&w=900&q=80',
  kids2:
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80',
};

export const products: Product[] = [
  // ---- WOMEN · KURTHIS ----
  {
    id: 'w-k-1',
    slug: 'aanya-hand-embroidered-kurthi-set',
    name: 'Aanya Hand-Embroidered Kurthi Set',
    audience: 'women',
    category: 'kurthis',
    subcategory: 'kurthi-pant-dupatta',
    price: 248,
    badge: 'New',
    image: img.kurthi1,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Saffron', 'Ivory'],
    fabric: 'Cotton',
    occasion: ['Festive', 'Everyday'],
    inStock: true,
    createdAt: '2026-03-22',
  },
  {
    id: 'w-k-2',
    slug: 'sahana-mul-cotton-only-kurthi',
    name: 'Sahana Mul Cotton Kurthi',
    audience: 'women',
    category: 'kurthis',
    subcategory: 'only-kurthi',
    price: 128,
    image: img.kurthi2,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Ivory', 'Plum'],
    fabric: 'Cotton',
    occasion: ['Everyday'],
    inStock: true,
    createdAt: '2026-02-10',
  },
  {
    id: 'w-k-3',
    slug: 'isha-top-with-dupatta',
    name: 'Isha Block-Print Top with Dupatta',
    audience: 'women',
    category: 'kurthis',
    subcategory: 'top-with-dupatta',
    price: 168,
    badge: 'Best Seller',
    image: img.kurthi3,
    sizes: ['XS', 'S', 'M'],
    colors: ['Ember', 'Ivory'],
    fabric: 'Cotton',
    occasion: ['Everyday', 'Festive'],
    inStock: true,
    createdAt: '2026-01-18',
  },
  {
    id: 'w-k-4',
    slug: 'devika-silk-kurthi-set',
    name: 'Devika Silk Kurthi Pant Dupatta',
    audience: 'women',
    category: 'kurthis',
    subcategory: 'kurthi-pant-dupatta',
    price: 312,
    originalPrice: 380,
    image: img.kurthi1,
    sizes: ['M', 'L', 'XL'],
    colors: ['Magenta', 'Plum'],
    fabric: 'Silk',
    occasion: ['Festive', 'Wedding'],
    inStock: true,
    createdAt: '2026-03-01',
  },

  // ---- WOMEN · SALWAR SUIT ----
  {
    id: 'w-s-1',
    slug: 'mira-anarkali-salwar-suit',
    name: 'Mira Anarkali Salwar Suit',
    audience: 'women',
    category: 'salwar-suit',
    price: 286,
    badge: 'Festive',
    image: img.kurthi2,
    sizes: ['S', 'M', 'L'],
    colors: ['Crimson', 'Saffron'],
    fabric: 'Georgette',
    occasion: ['Festive', 'Wedding'],
    inStock: true,
    createdAt: '2026-03-12',
  },
  {
    id: 'w-s-2',
    slug: 'kavya-everyday-salwar',
    name: 'Kavya Everyday Salwar',
    audience: 'women',
    category: 'salwar-suit',
    price: 158,
    image: img.kurthi3,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Ivory'],
    fabric: 'Cotton',
    occasion: ['Everyday'],
    inStock: false,
    createdAt: '2025-12-04',
  },

  // ---- WOMEN · SAREES ----
  {
    id: 'w-sa-1',
    slug: 'meera-banarasi-silk-saree',
    name: 'Meera Banarasi Silk Saree',
    audience: 'women',
    category: 'sarees',
    subcategory: 'stitched-blouse',
    price: 412,
    originalPrice: 520,
    badge: 'Best Seller',
    image: img.saree1,
    sizes: ['Free Size'],
    colors: ['Crimson', 'Saffron'],
    fabric: 'Banarasi Silk',
    occasion: ['Wedding', 'Festive'],
    inStock: true,
    createdAt: '2026-02-25',
  },
  {
    id: 'w-sa-2',
    slug: 'lalitha-soft-silk-saree',
    name: 'Lalitha Soft Silk Saree',
    audience: 'women',
    category: 'sarees',
    subcategory: 'unstitched-blouse',
    price: 348,
    image: img.saree2,
    sizes: ['Free Size'],
    colors: ['Plum', 'Magenta'],
    fabric: 'Silk',
    occasion: ['Festive'],
    inStock: true,
    createdAt: '2026-03-08',
  },
  {
    id: 'w-sa-3',
    slug: 'radhika-organza-saree',
    name: 'Radhika Organza Saree',
    audience: 'women',
    category: 'sarees',
    subcategory: 'stitched-blouse',
    price: 288,
    badge: 'New',
    image: img.saree1,
    sizes: ['Free Size'],
    colors: ['Ivory', 'Saffron'],
    fabric: 'Organza',
    occasion: ['Festive', 'Reception'],
    inStock: true,
    createdAt: '2026-03-30',
  },

  // ---- WOMEN · LEHENGA ----
  {
    id: 'w-l-1',
    slug: 'tara-hand-block-lehenga',
    name: 'Tara Hand-Block Lehenga',
    audience: 'women',
    category: 'lehenga',
    price: 624,
    badge: 'New',
    image: img.lehenga1,
    sizes: ['S', 'M', 'L'],
    colors: ['Saffron', 'Plum'],
    fabric: 'Silk',
    occasion: ['Wedding'],
    inStock: true,
    createdAt: '2026-03-26',
  },
  {
    id: 'w-l-2',
    slug: 'ananya-bridal-lehenga',
    name: 'Ananya Bridal Lehenga',
    audience: 'women',
    category: 'lehenga',
    price: 1240,
    image: img.lehenga1,
    sizes: ['S', 'M'],
    colors: ['Crimson'],
    fabric: 'Silk',
    occasion: ['Wedding'],
    inStock: true,
    createdAt: '2026-01-30',
  },

  // ---- WOMEN · READYMADE BLOUSE ----
  {
    id: 'w-b-1',
    slug: 'priya-embroidered-blouse',
    name: 'Priya Embroidered Blouse',
    audience: 'women',
    category: 'readymade-blouse',
    price: 92,
    image: img.kurthi3,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Ivory', 'Magenta'],
    fabric: 'Cotton',
    occasion: ['Festive', 'Everyday'],
    inStock: true,
    createdAt: '2026-02-18',
  },

  // ---- MEN ----
  {
    id: 'm-k-1',
    slug: 'ishaan-cotton-kurtha',
    name: 'Ishaan Cotton Kurtha',
    audience: 'men',
    category: 'kurtha',
    price: 128,
    badge: 'Best Seller',
    image: img.men1,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Ivory', 'Saffron'],
    fabric: 'Cotton',
    occasion: ['Everyday', 'Festive'],
    inStock: true,
    createdAt: '2026-02-22',
  },
  {
    id: 'm-kp-1',
    slug: 'ishaan-cotton-kurtha-pyjama',
    name: 'Ishaan Cotton Kurtha & Pyjama',
    audience: 'men',
    category: 'kurtha-pyjama',
    price: 186,
    badge: 'Festive',
    image: img.men1,
    sizes: ['M', 'L', 'XL'],
    colors: ['Ivory'],
    fabric: 'Cotton',
    occasion: ['Festive', 'Wedding'],
    inStock: true,
    createdAt: '2026-03-04',
  },
  {
    id: 'm-sh-1',
    slug: 'arjun-linen-shirt',
    name: 'Arjun Linen Shirt',
    audience: 'men',
    category: 'shirts',
    price: 96,
    image: img.men2,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Ivory', 'Plum'],
    fabric: 'Linen',
    occasion: ['Everyday'],
    inStock: true,
    createdAt: '2026-01-12',
  },
  {
    id: 'm-d-1',
    slug: 'rohan-silk-dhoti',
    name: 'Rohan Silk Dhoti',
    audience: 'men',
    category: 'dhoti',
    price: 142,
    image: img.men2,
    sizes: ['Free Size'],
    colors: ['Ivory', 'Saffron'],
    fabric: 'Silk',
    occasion: ['Festive', 'Wedding'],
    inStock: true,
    createdAt: '2026-02-02',
  },

  // ---- KIDS ----
  {
    id: 'k-k-1',
    slug: 'little-anaya-kurthi',
    name: 'Little Anaya Kurthi',
    audience: 'kids',
    category: 'kurthis',
    subcategory: 'only-kurthi',
    price: 64,
    badge: 'New',
    image: img.kids1,
    sizes: ['2-3Y', '4-5Y', '6-7Y'],
    colors: ['Saffron', 'Ivory'],
    fabric: 'Cotton',
    occasion: ['Everyday', 'Festive'],
    inStock: true,
    createdAt: '2026-03-18',
  },
  {
    id: 'k-k-2',
    slug: 'little-arya-kurthi-set',
    name: 'Little Arya Kurthi Set',
    audience: 'kids',
    category: 'kurthis',
    subcategory: 'kurthi-set',
    price: 92,
    badge: 'Festive',
    image: img.kids2,
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colors: ['Magenta', 'Plum'],
    fabric: 'Cotton',
    occasion: ['Festive'],
    inStock: true,
    createdAt: '2026-02-28',
  },
  {
    id: 'k-s-1',
    slug: 'little-mira-salwar',
    name: 'Little Mira Salwar Suit',
    audience: 'kids',
    category: 'salwar-suit',
    price: 84,
    image: img.kids1,
    sizes: ['4-5Y', '6-7Y', '8-9Y'],
    colors: ['Ivory', 'Saffron'],
    fabric: 'Cotton',
    occasion: ['Festive', 'Everyday'],
    inStock: true,
    createdAt: '2026-01-22',
  },
];

// ---- Query helpers ----

export function productsByAudience(audience: Audience): Product[] {
  return products.filter((p) => p.audience === audience);
}

export function productsByCategory(
  audience: Audience,
  category: string,
): Product[] {
  return products.filter(
    (p) => p.audience === audience && p.category === category,
  );
}

export function productsBySubcategory(
  audience: Audience,
  category: string,
  subcategory: string,
): Product[] {
  return products.filter(
    (p) =>
      p.audience === audience &&
      p.category === category &&
      p.subcategory === subcategory,
  );
}

export function getProductBySlug(slug: string): Product | null {
  return products.find((p) => p.slug === slug) ?? null;
}
