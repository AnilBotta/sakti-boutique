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
