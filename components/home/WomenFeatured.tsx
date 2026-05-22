import Image from 'next/image';
import Link from 'next/link';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { womenFeatured } from '@/lib/home/placeholder-data';
import {
  listSiteImages,
  type SiteImageSlot,
} from '@/lib/repositories/site-imagery';

// Map each homepage tile to the `site_imagery` slot the admin uploads to.
// Keep label values in sync with `lib/home/placeholder-data.ts`.
const SLOT_BY_LABEL: Record<string, SiteImageSlot> = {
  Kurthis: 'women_featured_kurthis',
  'Salwar Suit': 'women_featured_salwar_suit',
  Sarees: 'women_featured_sarees',
  Lehenga: 'women_featured_lehenga',
  'Readymade Blouse': 'women_featured_readymade_blouse',
};

const SLOTS: SiteImageSlot[] = [
  'women_featured_kurthis',
  'women_featured_salwar_suit',
  'women_featured_sarees',
  'women_featured_lehenga',
  'women_featured_readymade_blouse',
];

export async function WomenFeatured() {
  // Fetch admin-uploaded slots in one round-trip. Each tile falls back to the
  // hardcoded URL when no upload exists yet, so we don't regress shipped slots.
  const slotImages = await listSiteImages(SLOTS);

  return (
    <Section tone="subtle" width="editorial">
      <SectionHeading
        eyebrow="The Women's House"
        title="Featured silhouettes"
        lede="From everyday kurthis to wedding-day lehengas — five categories, each with its own quiet character."
      />

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="-mx-5 md:mx-0">
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:grid md:grid-cols-5 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {womenFeatured.map((item, i) => {
            const slotKey = SLOT_BY_LABEL[item.label];
            const slot = slotKey ? slotImages[slotKey] : null;
            const imageSrc = slot?.url || item.image;
            const altText = slot?.alt || item.label;
            return (
              <li
                key={item.label}
                className="w-[68%] flex-shrink-0 snap-start md:w-auto"
              >
                <Reveal delay={i * 0.06}>
                  <Link href={item.href} className="group block">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-canvas">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={altText}
                          fill
                          sizes="(min-width: 768px) 18vw, 70vw"
                          className="object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.03]"
                          unoptimized={!!slot?.url}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-caption text-text-muted">
                          Image coming soon
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-body font-medium text-text-primary">
                        {item.label}
                      </p>
                      <span className="mt-1 inline-block text-caption text-text-muted transition-colors duration-fast ease-standard group-hover:text-accent-ember">
                        Shop →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
