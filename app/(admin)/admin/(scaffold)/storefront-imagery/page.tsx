import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import {
  listSiteImages,
  SITE_IMAGE_SLOTS,
} from '@/lib/repositories/site-imagery';
import { SiteImagerySlotEditor } from '@/components/admin/storefront-imagery/SiteImagerySlotEditor';

const SLOT_META = {
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
} as const;

export default async function AdminStorefrontImageryPage() {
  const slots = await listSiteImages(SITE_IMAGE_SLOTS);
  return (
    <AdminScaffoldPage
      eyebrow="Storefront"
      title="Storefront Imagery"
      description="Upload editorial images shown on the customer storefront. Changes take effect immediately."
    >
      {SITE_IMAGE_SLOTS.map((slot) => (
        <AdminSectionCard key={slot} title={SLOT_META[slot].label}>
          <SiteImagerySlotEditor
            slot={slot}
            description={SLOT_META[slot].description}
            initial={slots[slot]}
          />
        </AdminSectionCard>
      ))}
    </AdminScaffoldPage>
  );
}
