import Image from 'next/image';
import Link from 'next/link';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { audienceTiles } from '@/lib/home/placeholder-data';
import {
  listSiteImages,
  type SiteImageSlot,
} from '@/lib/repositories/site-imagery';

const SLOT_BY_AUDIENCE: Record<string, SiteImageSlot> = {
  Women: 'audience_women',
  Men: 'audience_men',
  Kids: 'audience_kids',
};

export async function AudienceTiles() {
  // Fetch any admin-uploaded slot images in one round-trip.
  // Falls back to the hardcoded URL for slots that haven't been uploaded yet.
  const slotImages = await listSiteImages([
    'audience_women',
    'audience_men',
    'audience_kids',
  ]);

  return (
    <Section width="editorial">
      <SectionHeading
        eyebrow="Shop the House"
        title="Three collections, one atelier"
        lede="Every piece is curated to feel modern, festive, and unmistakably Sakthi."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {audienceTiles.map((tile, i) => {
          const slotKey = SLOT_BY_AUDIENCE[tile.label];
          const slot = slotKey ? slotImages[slotKey] : null;
          const imageSrc = slot?.url || tile.image;
          const altText = slot?.alt || `${tile.label} collection`;

          return (
            <Reveal key={tile.label} delay={i * 0.08}>
              <Link
                href={tile.href}
                className="group relative block overflow-hidden"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-muted">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={altText}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.03]"
                      unoptimized={!!slot?.url}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-caption text-text-muted">
                      Image coming soon
                    </div>
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 transition-transform duration-base ease-standard group-hover:-translate-y-1 md:p-8">
                  <p className="eyebrow text-bg-canvas/85">{tile.eyebrow}</p>
                  <h3 className="mt-2 text-h2 font-medium text-bg-canvas">
                    {tile.label}
                  </h3>
                  <span className="mt-3 inline-block text-caption uppercase tracking-[0.14em] text-bg-canvas/85 transition-colors duration-fast ease-standard group-hover:text-bg-canvas">
                    Explore →
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
