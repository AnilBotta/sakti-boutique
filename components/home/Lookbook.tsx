import Image from 'next/image';
import Link from 'next/link';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { lookbookImages } from '@/lib/home/placeholder-data';
import {
  listSiteImages,
  type SiteImageSlot,
} from '@/lib/repositories/site-imagery';

const LOOKBOOK_SLOTS: SiteImageSlot[] = [
  'lookbook_1',
  'lookbook_2',
  'lookbook_3',
  'lookbook_4',
];

export async function Lookbook() {
  // Fetch all four lookbook slots in one round-trip. Each frame falls back
  // to the hardcoded URL when no upload exists yet.
  const slots = await listSiteImages(LOOKBOOK_SLOTS);

  const frames = LOOKBOOK_SLOTS.map((slot, i) => {
    const fallback = lookbookImages[i];
    const uploaded = slots[slot];
    return {
      src: uploaded?.url || fallback.src,
      alt: uploaded?.alt || fallback.alt,
      uploaded: !!uploaded?.url,
    };
  });

  return (
    <Section width="editorial">
      <SectionHeading
        eyebrow="The Sakthi Journal"
        title="A festive lookbook"
        lede="Editorial moments from our latest collection — styled for celebrations, photographed in warm afternoon light."
      />

      {/* Staggered editorial grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-6">
        <Reveal className="md:col-span-7">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-muted md:aspect-[5/6]">
            <Image
              src={frames[0].src}
              alt={frames[0].alt}
              fill
              sizes="(min-width: 768px) 58vw, 50vw"
              className="object-cover"
              unoptimized={frames[0].uploaded}
            />
          </div>
        </Reveal>

        <div className="md:col-span-5 md:flex md:flex-col md:gap-6">
          <Reveal delay={0.08}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-muted">
              <Image
                src={frames[1].src}
                alt={frames[1].alt}
                fill
                sizes="(min-width: 768px) 42vw, 50vw"
                className="object-cover"
                unoptimized={frames[1].uploaded}
              />
            </div>
          </Reveal>
          <Reveal delay={0.16} className="hidden md:block">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-muted">
              <Image
                src={frames[2].src}
                alt={frames[2].alt}
                fill
                sizes="42vw"
                className="object-cover"
                unoptimized={frames[2].uploaded}
              />
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="col-span-2 md:col-span-12">
          <div className="relative mt-2 aspect-[16/9] w-full overflow-hidden bg-bg-muted md:mt-2 md:aspect-[21/9]">
            <Image
              src={frames[3].src}
              alt={frames[3].alt}
              fill
              sizes="100vw"
              className="object-cover"
              unoptimized={frames[3].uploaded}
            />
          </div>
        </Reveal>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/about"
          className="text-caption uppercase tracking-[0.14em] text-text-secondary transition-colors duration-fast ease-standard hover:text-accent-ember"
        >
          Explore the Journal →
        </Link>
      </div>
    </Section>
  );
}
