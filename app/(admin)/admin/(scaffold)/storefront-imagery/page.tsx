import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import {
  listSiteImages,
  SITE_IMAGE_SLOTS,
  type SiteImageSlot,
} from '@/lib/repositories/site-imagery';
import { SiteImagerySlotEditor } from '@/components/admin/storefront-imagery/SiteImagerySlotEditor';

interface SlotMeta {
  label: string;
  description: string;
}

const SLOT_META: Record<SiteImageSlot, SlotMeta> = {
  // -- Audience tiles ------------------------------------------------------
  audience_women: {
    label: 'Women audience tile',
    description:
      'The Women card in the "Three collections, one atelier" section on the homepage.',
  },
  audience_men: {
    label: 'Men audience tile',
    description:
      'The Men card in the "Three collections, one atelier" section on the homepage.',
  },
  audience_kids: {
    label: 'Kids audience tile',
    description:
      'The Kids card in the "Three collections, one atelier" section on the homepage.',
  },
  // -- Featured silhouettes (Women) ----------------------------------------
  women_featured_kurthis: {
    label: 'Women — Kurthis tile',
    description:
      'The Kurthis card in the "Featured silhouettes" rail on the homepage.',
  },
  women_featured_salwar_suit: {
    label: 'Women — Salwar Suit tile',
    description:
      'The Salwar Suit card in the "Featured silhouettes" rail on the homepage.',
  },
  women_featured_sarees: {
    label: 'Women — Sarees tile',
    description:
      'The Sarees card in the "Featured silhouettes" rail on the homepage.',
  },
  women_featured_lehenga: {
    label: 'Women — Lehenga tile',
    description:
      'The Lehenga card in the "Featured silhouettes" rail on the homepage.',
  },
  women_featured_readymade_blouse: {
    label: 'Women — Readymade Blouse tile',
    description:
      'The Readymade Blouse card in the "Featured silhouettes" rail on the homepage.',
  },
  // -- Editorial -----------------------------------------------------------
  brand_story: {
    label: 'Brand story image',
    description:
      'The image beside the "Slow craft. Modern soul." block on the homepage.',
  },
  tryon_teaser: {
    label: 'Try-On teaser image',
    description:
      'The image beside the "See how it looks on you." Try-On promo on the homepage.',
  },
  lookbook_1: {
    label: 'Lookbook — frame 1 (left/large)',
    description:
      'The largest lookbook frame on the left of "A festive lookbook" on the homepage.',
  },
  lookbook_2: {
    label: 'Lookbook — frame 2 (top right)',
    description: 'Top-right frame in the lookbook grid.',
  },
  lookbook_3: {
    label: 'Lookbook — frame 3 (middle right)',
    description: 'Middle-right frame in the lookbook grid (desktop only).',
  },
  lookbook_4: {
    label: 'Lookbook — frame 4 (full width)',
    description: 'Wide frame across the bottom of the lookbook grid.',
  },
  // -- Category banners — Women -------------------------------------------
  category_women_kurthis: {
    label: 'Women → Kurthis banner',
    description:
      'The image used for the Kurthis tile on /women and the banner area of /women/kurthis.',
  },
  category_women_salwar_suit: {
    label: 'Women → Salwar Suit banner',
    description:
      'The image used for the Salwar Suit tile on /women and the banner area of /women/salwar-suit.',
  },
  category_women_sarees: {
    label: 'Women → Sarees banner',
    description:
      'The image used for the Sarees tile on /women and the banner area of /women/sarees.',
  },
  category_women_lehenga: {
    label: 'Women → Lehenga banner',
    description:
      'The image used for the Lehenga tile on /women and the banner area of /women/lehenga.',
  },
  category_women_readymade_blouse: {
    label: 'Women → Readymade Blouse banner',
    description:
      'The image used for the Readymade Blouse tile on /women and /women/readymade-blouse.',
  },
  // -- Category banners — Men ---------------------------------------------
  category_men_kurtha: {
    label: 'Men → Kurtha banner',
    description: 'Used for the Kurtha tile on /men and /men/kurtha.',
  },
  category_men_kurtha_pyjama: {
    label: 'Men → Kurtha / Pyjama banner',
    description:
      'Used for the Kurtha / Pyjama tile on /men and /men/kurtha-pyjama.',
  },
  category_men_shirts: {
    label: 'Men → Shirts banner',
    description: 'Used for the Shirts tile on /men and /men/shirts.',
  },
  category_men_dhoti: {
    label: 'Men → Dhoti banner',
    description: 'Used for the Dhoti tile on /men and /men/dhoti.',
  },
  // -- Category banners — Kids --------------------------------------------
  category_kids_kurthis: {
    label: 'Kids → Kurthis banner',
    description: 'Used for the Kurthis tile on /kids and /kids/kurthis.',
  },
  category_kids_salwar_suit: {
    label: 'Kids → Salwar Suit banner',
    description: 'Used for the Salwar Suit tile on /kids and /kids/salwar-suit.',
  },
};

interface SlotGroup {
  title: string;
  description: string;
  slots: readonly SiteImageSlot[];
}

const SLOT_GROUPS: SlotGroup[] = [
  {
    title: 'Three collections, one atelier',
    description: 'The three audience cards shown directly under the homepage hero.',
    slots: ['audience_women', 'audience_men', 'audience_kids'],
  },
  {
    title: 'Featured silhouettes (Women)',
    description:
      'The five category tiles in "Featured silhouettes" further down the homepage.',
    slots: [
      'women_featured_kurthis',
      'women_featured_salwar_suit',
      'women_featured_sarees',
      'women_featured_lehenga',
      'women_featured_readymade_blouse',
    ],
  },
  {
    title: 'Editorial',
    description: 'Brand story, Try-On teaser, and the lookbook montage.',
    slots: [
      'brand_story',
      'tryon_teaser',
      'lookbook_1',
      'lookbook_2',
      'lookbook_3',
      'lookbook_4',
    ],
  },
  {
    title: 'Category banners — Women',
    description: 'Replaces the tile + banner image for each Women category page.',
    slots: [
      'category_women_kurthis',
      'category_women_salwar_suit',
      'category_women_sarees',
      'category_women_lehenga',
      'category_women_readymade_blouse',
    ],
  },
  {
    title: 'Category banners — Men',
    description: 'Replaces the tile + banner image for each Men category page.',
    slots: [
      'category_men_kurtha',
      'category_men_kurtha_pyjama',
      'category_men_shirts',
      'category_men_dhoti',
    ],
  },
  {
    title: 'Category banners — Kids',
    description: 'Replaces the tile + banner image for each Kids category page.',
    slots: ['category_kids_kurthis', 'category_kids_salwar_suit'],
  },
];

export default async function AdminStorefrontImageryPage() {
  const slots = await listSiteImages(SITE_IMAGE_SLOTS);
  return (
    <AdminScaffoldPage
      eyebrow="Storefront"
      title="Storefront Imagery"
      description="Upload editorial images shown on the customer storefront. Changes take effect immediately."
    >
      {SLOT_GROUPS.map((group) => (
        <section key={group.title} className="flex flex-col gap-4">
          <header className="border-b border-border-hairline pb-3">
            <h2 className="text-h3 font-medium text-text-primary">
              {group.title}
            </h2>
            <p className="mt-1 text-caption text-text-muted">
              {group.description}
            </p>
          </header>
          {group.slots.map((slot) => (
            <AdminSectionCard key={slot} title={SLOT_META[slot].label}>
              <SiteImagerySlotEditor
                slot={slot}
                description={SLOT_META[slot].description}
                initial={slots[slot]}
              />
            </AdminSectionCard>
          ))}
        </section>
      ))}
    </AdminScaffoldPage>
  );
}
