import Image from 'next/image';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import {
  listSiteImages,
  type SiteImageSlot,
} from '@/lib/repositories/site-imagery';

interface Shot {
  slot: SiteImageSlot;
  fallbackSrc: string;
  fallbackAlt: string;
  caption: string;
}

const shots: Shot[] = [
  {
    slot: 'about_atelier_fabric',
    fallbackSrc:
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85',
    fallbackAlt: 'Fabric being selected by hand',
    caption: 'Fabric',
  },
  {
    slot: 'about_atelier_embroidery',
    fallbackSrc:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85',
    fallbackAlt: 'Hand embroidery in progress',
    caption: 'Embroidery',
  },
  {
    slot: 'about_atelier_dye',
    fallbackSrc:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85',
    fallbackAlt: 'Natural dyeing at the atelier',
    caption: 'Dye',
  },
  {
    slot: 'about_atelier_finish',
    fallbackSrc:
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85',
    fallbackAlt: 'Finishing and pressing before dispatch',
    caption: 'Finish',
  },
];

export async function AtelierStrip() {
  const slots = await listSiteImages(shots.map((s) => s.slot));
  return (
    <Section tone="subtle">
      <SectionHeading
        eyebrow="Inside the Atelier"
        title="The craft, in four frames."
        lede="Fabric, embroidery, dye, finish — a glimpse at the hands behind every piece."
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {shots.map((s, i) => {
          const live = slots[s.slot];
          const src = live?.url || s.fallbackSrc;
          const alt = live?.alt || s.fallbackAlt;
          const uploaded = !!live?.url;
          return (
            <Reveal key={s.caption} delay={i * 0.08}>
              <figure className="flex flex-col gap-3">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-muted">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(min-width: 768px) 22vw, 50vw"
                    className="object-cover"
                    unoptimized={uploaded}
                  />
                </div>
                <figcaption className="eyebrow text-text-muted">
                  {s.caption}
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
