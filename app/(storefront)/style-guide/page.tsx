import Image from 'next/image';
import type { Metadata } from 'next';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Photo Style Guide',
  description:
    'Internal photo-direction reference for Sakthi Trends USA. Approve the look before real shoots.',
  robots: { index: false, follow: false },
};

interface Shot {
  src: string;
  alt: string;
  caption: string;
  note: string;
}

const heroShots: Shot[] = [
  {
    src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=85',
    alt: 'Close-up of zardozi embroidery catching afternoon light',
    caption: 'Option A — Fabric macro',
    note: 'Hero video fallback. 16:9, warm studio light, low DOF.',
  },
  {
    src: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1800&q=85',
    alt: 'Model draped in a saree in natural window light',
    caption: 'Option B — Model drape',
    note: 'Cinematic hero. Vertical-friendly crop, eyes off-camera.',
  },
  {
    src: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1800&q=85',
    alt: 'Atelier styling consultation in warm ambient light',
    caption: 'Option C — Atelier moment',
    note: 'Story-first hero. Two-person composition, muted palette.',
  },
];

const categoryBanners: Record<'Women' | 'Men' | 'Kids', Shot[]> = {
  Women: [
    {
      src: 'https://images.unsplash.com/photo-1583391733981-8498408ee0fc?auto=format&fit=crop&w=1400&q=85',
      alt: 'Woman in kurthi set, studio portrait',
      caption: 'Women — Kurthi',
      note: 'Full silhouette, 4:5, neutral backdrop.',
    },
    {
      src: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1400&q=85',
      alt: 'Woman draped in silk saree against warm background',
      caption: 'Women — Sarees',
      note: 'Drape detail visible, warm tonal BG.',
    },
    {
      src: 'https://images.unsplash.com/photo-1610189019250-8b28d74fb53d?auto=format&fit=crop&w=1400&q=85',
      alt: 'Woman in lehenga, editorial pose',
      caption: 'Women — Lehenga',
      note: 'Skirt flow emphasized, 3:4 vertical.',
    },
  ],
  Men: [
    {
      src: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=1400&q=85',
      alt: 'Man in cotton kurtha, side profile',
      caption: 'Men — Kurtha',
      note: 'Clean stance, textural fabric closeup.',
    },
    {
      src: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1400&q=85',
      alt: 'Man in festive kurtha pyjama set',
      caption: 'Men — Kurtha / Pyjama',
      note: 'Full outfit, warm light.',
    },
    {
      src: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=85',
      alt: 'Man in crisp ethnic shirt',
      caption: 'Men — Shirts',
      note: 'Three-quarter portrait.',
    },
  ],
  Kids: [
    {
      src: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1400&q=85',
      alt: 'Child in festive kurthi set smiling',
      caption: 'Kids — Kurthi',
      note: 'Natural expression, soft daylight.',
    },
    {
      src: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=1400&q=85',
      alt: 'Child in salwar suit, playful pose',
      caption: 'Kids — Salwar',
      note: 'Movement allowed, crisp backdrop.',
    },
    {
      src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85',
      alt: 'Child in ethnic outfit, seated portrait',
      caption: 'Kids — Festive',
      note: 'Candid feel, warm tones.',
    },
  ],
};

const productCards: Shot[] = [
  {
    src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85',
    alt: 'Studio product shot A',
    caption: 'PDP card 01',
    note: '3:4 crop, white BG',
  },
  {
    src: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85',
    alt: 'Studio product shot B',
    caption: 'PDP card 02',
    note: '3:4 crop, warm neutral BG',
  },
  {
    src: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85',
    alt: 'Studio product shot C',
    caption: 'PDP card 03',
    note: 'Consistent framing',
  },
  {
    src: 'https://images.unsplash.com/photo-1610189019250-8b28d74fb53d?auto=format&fit=crop&w=900&q=85',
    alt: 'Studio product shot D',
    caption: 'PDP card 04',
    note: 'Lehenga full silhouette',
  },
  {
    src: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=900&q=85',
    alt: 'Studio product shot E',
    caption: 'PDP card 05',
    note: 'Men kurtha',
  },
  {
    src: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=85',
    alt: 'Studio product shot F',
    caption: 'PDP card 06',
    note: 'Kids festive',
  },
];

const editorialShots: Shot[] = [
  {
    src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
    alt: 'Fabric macro for editorial',
    caption: 'Fabric macro',
    note: 'Asymmetric left-heavy composition.',
  },
  {
    src: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85',
    alt: 'Hands embroidering',
    caption: 'Hands at work',
    note: 'Small gesture, human scale.',
  },
  {
    src: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1600&q=85',
    alt: 'Model draping saree',
    caption: 'Draping moment',
    note: 'Natural window light.',
  },
  {
    src: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1600&q=85',
    alt: 'Atelier table with fabric bolts',
    caption: 'Atelier table',
    note: 'Flat lay, warm neutrals.',
  },
];

const aboutShots: Shot[] = [
  {
    src: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=85',
    alt: 'About hero candidate',
    caption: 'About hero — wide',
    note: '16:9 wide, model + atelier.',
  },
  {
    src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Embroidery close-up',
    caption: 'Embroidery',
    note: 'Atelier strip 01',
  },
  {
    src: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=85',
    alt: 'Fabric selection',
    caption: 'Fabric',
    note: 'Atelier strip 02',
  },
  {
    src: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85',
    alt: 'Dyeing process',
    caption: 'Dye',
    note: 'Atelier strip 03',
  },
  {
    src: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=85',
    alt: 'Final press',
    caption: 'Finish',
    note: 'Atelier strip 04',
  },
];

const pdpGallery: Shot[] = [
  {
    src: 'https://images.unsplash.com/photo-1583391733981-8498408ee0fc?auto=format&fit=crop&w=1200&q=85',
    alt: 'Front view',
    caption: '01 · Front',
    note: 'Primary hero gallery shot.',
  },
  {
    src: 'https://images.unsplash.com/photo-1610189019250-8b28d74fb53d?auto=format&fit=crop&w=1200&q=85',
    alt: 'Back view',
    caption: '02 · Back',
    note: 'Silhouette reference.',
  },
  {
    src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Detail',
    caption: '03 · Detail',
    note: 'Embroidery macro.',
  },
  {
    src: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85',
    alt: 'On model',
    caption: '04 · On model',
    note: 'In-context styling.',
  },
  {
    src: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=85',
    alt: 'Flat lay',
    caption: '05 · Flat lay',
    note: 'Styling context.',
  },
];

function ShotTile({ shot, aspect }: { shot: Shot; aspect: string }) {
  return (
    <figure className="flex flex-col gap-3">
      <div
        className={`relative ${aspect} w-full overflow-hidden bg-bg-muted`}
      >
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <figcaption>
        <p className="eyebrow text-accent-ember">{shot.caption}</p>
        <p className="mt-1 text-caption text-text-muted">{shot.note}</p>
      </figcaption>
    </figure>
  );
}

export default function StyleGuidePage() {
  return (
    <>
      <Section>
        <Container width="text" className="!px-0 text-center">
          <p className="eyebrow mb-3 text-accent-ember">Internal · Noindex</p>
          <h1 className="text-h1 font-medium leading-tight text-text-primary md:text-display">
            Photo Style Guide
          </h1>
          <p className="mt-5 text-body-lg text-text-secondary">
            A curated reference for the look and feel we want in every Sakthi
            Trends USA photograph. Scroll through, approve the direction, and
            we will commission real shoots against it.
          </p>
        </Container>
      </Section>

      <Section tone="subtle">
        <SectionHeading
          eyebrow="01 · Hero"
          title="Homepage hero candidates"
          lede="One of these three moods should anchor the homepage. Pick one; we will shoot variations against it."
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {heroShots.map((s, i) => (
            <Reveal key={s.caption} delay={i * 0.08}>
              <ShotTile shot={s} aspect="aspect-[3/4]" />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="02 · Category banners"
          title="Women · Men · Kids"
          lede="Three candidates per audience. Consistent light temperature and background discipline across the set."
        />
        <div className="flex flex-col gap-14">
          {(Object.keys(categoryBanners) as Array<keyof typeof categoryBanners>).map(
            (audience) => (
              <div key={audience}>
                <p className="eyebrow mb-6 text-text-muted">{audience}</p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                  {categoryBanners[audience].map((s, i) => (
                    <Reveal key={s.caption} delay={i * 0.06}>
                      <ShotTile shot={s} aspect="aspect-[4/5]" />
                    </Reveal>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </Section>

      <Section tone="subtle">
        <SectionHeading
          eyebrow="03 · Product cards"
          title="Catalog grid at 3:4"
          lede="Tight crop discipline, a single background tone, no props. Every card looks like a family."
        />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8 lg:grid-cols-6">
          {productCards.map((s, i) => (
            <Reveal key={s.caption} delay={i * 0.04}>
              <ShotTile shot={s} aspect="aspect-[3/4]" />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="04 · Editorial"
          title="BrandStory & lookbook"
          lede="Asymmetric compositions for editorial blocks. Warm window light, human scale, restraint."
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          {editorialShots.map((s, i) => (
            <Reveal key={s.caption} delay={i * 0.06}>
              <ShotTile shot={s} aspect="aspect-[4/5]" />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="subtle">
        <SectionHeading
          eyebrow="05 · About & atelier"
          title="The hero plus a four-photo strip"
          lede="First image is the wide About hero; the next four form a strip showing the craft end-to-end."
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          <div className="lg:col-span-5">
            <Reveal>
              <ShotTile shot={aboutShots[0]} aspect="aspect-[21/9]" />
            </Reveal>
          </div>
          {aboutShots.slice(1).map((s, i) => (
            <Reveal key={s.caption} delay={i * 0.05}>
              <ShotTile shot={s} aspect="aspect-[3/4]" />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="06 · PDP gallery"
          title="Every product, shot five ways"
          lede="Front, back, detail, on-model, and flat-lay — the minimum standard for every product in the catalog."
        />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-5 md:gap-6">
          {pdpGallery.map((s, i) => (
            <Reveal key={s.caption} delay={i * 0.05}>
              <ShotTile shot={s} aspect="aspect-[4/5]" />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
