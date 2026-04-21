// Locked category tree per .claude/rules/01-product-brief.md
// Used by header, mega menu, mobile drawer, and footer.

export type NavSubcategory = { label: string; href: string };
export type NavCategory = {
  label: string;
  href: string;
  subcategories: NavSubcategory[];
};
export type NavSection = {
  audience: 'women' | 'men' | 'kids';
  label: string;
  href: string;
  categories: NavCategory[];
};

export const primaryNav: NavSection[] = [
  {
    audience: 'women',
    label: 'Women',
    href: '/women',
    categories: [
      {
        label: 'Kurthis',
        href: '/women/kurthis',
        subcategories: [
          { label: 'Kurthi / Pant / Dupatta', href: '/women/kurthis/kurthi-pant-dupatta' },
          { label: 'Only Top with Dupatta', href: '/women/kurthis/top-with-dupatta' },
          { label: 'Only Kurthi', href: '/women/kurthis/only-kurthi' },
        ],
      },
      { label: 'Salwar Suit', href: '/women/salwar-suit', subcategories: [] },
      {
        label: 'Sarees',
        href: '/women/sarees',
        subcategories: [
          { label: 'Sarees with Stitched Blouse', href: '/women/sarees/stitched-blouse' },
          { label: 'Sarees with Unstitched Blouse', href: '/women/sarees/unstitched-blouse' },
        ],
      },
      { label: 'Lehenga', href: '/women/lehenga', subcategories: [] },
      { label: 'Readymade Blouse', href: '/women/readymade-blouse', subcategories: [] },
    ],
  },
  {
    audience: 'men',
    label: 'Men',
    href: '/men',
    categories: [
      { label: 'Kurtha', href: '/men/kurtha', subcategories: [] },
      { label: 'Kurtha / Pyjama', href: '/men/kurtha-pyjama', subcategories: [] },
      { label: 'Shirts', href: '/men/shirts', subcategories: [] },
      { label: 'Dhoti', href: '/men/dhoti', subcategories: [] },
    ],
  },
  {
    audience: 'kids',
    label: 'Kids',
    href: '/kids',
    categories: [
      {
        label: 'Kurthis',
        href: '/kids/kurthis',
        subcategories: [
          { label: 'Only Kurthi', href: '/kids/kurthis/only-kurthi' },
          { label: 'Kurthi Set', href: '/kids/kurthis/kurthi-set' },
        ],
      },
      { label: 'Salwar Suit', href: '/kids/salwar-suit', subcategories: [] },
    ],
  },
];

export const footerLinks = {
  shop: [
    { label: 'Women', href: '/women' },
    { label: 'Men', href: '/men' },
    { label: 'Kids', href: '/kids' },
    { label: 'New Arrivals', href: '/collections/new' },
  ],
  help: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping & Returns', href: '/faq#shipping' },
    { label: 'Size Guide', href: '/faq#size' },
  ],
  about: [
    { label: 'Our Story', href: '/about' },
    { label: 'Journal', href: '/journal' },
  ],
};
