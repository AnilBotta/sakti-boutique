// Placeholder homepage data. Replace with Supabase-backed queries in a later step.
// Imagery: Unsplash (whitelisted in next.config.mjs).

export const audienceTiles = [
  {
    label: 'Women',
    href: '/women',
    eyebrow: 'Primary Atelier',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Men',
    href: '/men',
    eyebrow: 'Heritage Tailoring',
    image:
      'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Kids',
    href: '/kids',
    eyebrow: 'Festive Little Ones',
    image:
      'https://images.unsplash.com/photo-1503944168849-8bf86875b08e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const womenFeatured = [
  {
    label: 'Kurthis',
    href: '/women/kurthis',
    image:
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Salwar Suit',
    href: '/women/salwar-suit',
    image:
      'https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Sarees',
    href: '/women/sarees',
    image:
      'https://images.unsplash.com/photo-1594387310467-bb8b1ba73e2e?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Lehenga',
    href: '/women/lehenga',
    image:
      'https://images.unsplash.com/photo-1610189019926-f8a4ec1cc7e3?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Readymade Blouse',
    href: '/women/readymade-blouse',
    image:
      'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=900&q=80',
  },
];

export type FeaturedProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  badge?: 'New' | 'Best Seller' | 'Festive';
  image: string;
  href: string;
};

export const featuredProducts: FeaturedProduct[] = [
  {
    id: 'p1',
    name: 'Aanya Hand-Embroidered Kurthi Set',
    category: 'Kurthi · Pant · Dupatta',
    price: 248,
    badge: 'New',
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    href: '/p/aanya-hand-embroidered-kurthi-set',
  },
  {
    id: 'p2',
    name: 'Meera Banarasi Silk Saree',
    category: 'Saree with Stitched Blouse',
    price: 412,
    originalPrice: 520,
    badge: 'Best Seller',
    image:
      'https://images.unsplash.com/photo-1594387310467-bb8b1ba73e2e?auto=format&fit=crop&w=900&q=80',
    href: '/p/meera-banarasi-silk-saree',
  },
  {
    id: 'p3',
    name: 'Ishaan Cotton Kurtha & Pyjama',
    category: "Men's Ethnic",
    price: 186,
    badge: 'Festive',
    image:
      'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=900&q=80',
    href: '/p/ishaan-cotton-kurtha-pyjama',
  },
  {
    id: 'p4',
    name: 'Tara Hand-Block Lehenga',
    category: 'Lehenga',
    price: 624,
    badge: 'New',
    image:
      'https://images.unsplash.com/photo-1610189019926-f8a4ec1cc7e3?auto=format&fit=crop&w=900&q=80',
    href: '/p/tara-hand-block-lehenga',
  },
];

export const testimonials = [
  {
    quote:
      'The craftsmanship is extraordinary. My Banarasi saree arrived beautifully packaged and the silk is exactly as pictured.',
    name: 'Priya R.',
    location: 'San Francisco, CA',
  },
  {
    quote:
      'Finally a boutique that understands modern silhouettes without losing the soul of traditional Indian wear.',
    name: 'Anita M.',
    location: 'Austin, TX',
  },
  {
    quote:
      'The Try Me feature helped me pick the right kurthi for Diwali. My family was stunned. Sakthi is now my go-to.',
    name: 'Divya K.',
    location: 'New Jersey',
  },
];

export const lookbookImages = [
  {
    src: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1000&q=80',
    alt: 'Editorial: hand-embroidered kurthi in soft daylight',
  },
  {
    src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    alt: 'Festive saree styled in warm afternoon light',
  },
  {
    src: 'https://images.unsplash.com/photo-1594387310467-bb8b1ba73e2e?auto=format&fit=crop&w=900&q=80',
    alt: 'Banarasi silk close-up',
  },
  {
    src: 'https://images.unsplash.com/photo-1610189019926-f8a4ec1cc7e3?auto=format&fit=crop&w=900&q=80',
    alt: 'Lehenga set photographed against linen',
  },
];
