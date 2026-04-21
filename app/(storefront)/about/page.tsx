import Image from 'next/image';
import type { Metadata } from 'next';
import { PageHero } from '@/components/content/PageHero';
import { RichTextSection } from '@/components/content/RichTextSection';
import { ContentCtaBlock } from '@/components/content/ContentCtaBlock';
import { Section } from '@/components/layout/Section';
import { EditorialBlock } from '@/components/layout/EditorialBlock';
import { Reveal } from '@/components/motion/Reveal';
import { AtelierStrip } from '@/components/about/AtelierStrip';
import { CraftTimeline } from '@/components/about/CraftTimeline';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Sakthi Trends USA is a premium ethnic fashion atelier — crafted for the modern woman, rooted in tradition. Meet the people, the craft, and the philosophy behind the label.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Our Story · Sakthi Trends USA',
    description:
      'A premium ethnic fashion atelier — crafted for the modern woman, rooted in tradition.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title={
          <>
            Crafted for the modern woman,
            <br className="hidden md:inline" /> rooted in tradition.
          </>
        }
        lede="Sakthi Trends USA is a small, considered atelier. Every piece we make is a conversation between heritage craft and the way women actually live today — festive, refined, quietly confident."
        image={{
          src: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=2000&q=85',
          alt: 'A draped saree in warm natural light, photographed on a muted studio backdrop',
        }}
      />

      <RichTextSection
        eyebrow="The Atelier"
        title="A label built on restraint, not excess."
      >
        <p>
          Sakthi began with a simple frustration: festive wear had become loud,
          disposable, and indistinguishable. We wanted garments that felt
          personal — the kind of pieces you reach for again and again, that
          photograph beautifully and feel even better.
        </p>
        <p>
          Each collection is designed in small runs. We work directly with
          artisan partners across India, choose fabrics by hand, and resist the
          urge to chase every trend. The result is a wardrobe that&rsquo;s
          contemporary in silhouette but unmistakably grounded in craft.
        </p>
      </RichTextSection>

      <Section>
        <EditorialBlock
          media={
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-muted">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85"
                alt="Close-up of hand embroidery on silk"
                fill
                sizes="(min-width: 768px) 58vw, 100vw"
                className="object-cover"
              />
            </div>
          }
        >
          <Reveal>
            <p className="eyebrow text-accent-ember">Craftsmanship</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-h2 font-medium leading-tight text-text-primary md:text-[2.25rem]">
              The hand is the point.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-body-lg leading-relaxed text-text-secondary">
              From zardozi and aari to block prints and handloom weaves, every
              technique we use is human. We credit the makers we work with, pay
              fairly, and measure a collection by how well it wears — not how
              quickly we can ship it.
            </p>
          </Reveal>
        </EditorialBlock>
      </Section>

      <AtelierStrip />

      <CraftTimeline />

      <RichTextSection
        eyebrow="What Sets Us Apart"
        title="Three things we refuse to compromise on."
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className="eyebrow mb-2 text-accent-ember">01 · Fabric first</p>
            <p>
              We start with cloth, not trends. Silks, cottons, and handlooms
              are chosen for how they drape, breathe, and age gracefully.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-accent-ember">02 · Honest fit</p>
            <p>
              Sizing is built on real bodies, not idealised mannequins. Our
              size guide is transparent, and our team will help you choose.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-accent-ember">03 · Small batches</p>
            <p>
              We&rsquo;d rather make a hundred pieces well than a thousand in a
              hurry. Some styles sell out — and we think that&rsquo;s the right
              trade-off.
            </p>
          </div>
        </div>
      </RichTextSection>

      <Section>
        <EditorialBlock
          reverse
          media={
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-muted">
              <Image
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85"
                alt="A styling consultation in warm ambient light"
                fill
                sizes="(min-width: 768px) 58vw, 100vw"
                className="object-cover"
              />
            </div>
          }
        >
          <Reveal>
            <p className="eyebrow text-accent-ember">Service</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-h2 font-medium leading-tight text-text-primary md:text-[2.25rem]">
              A boutique, not a warehouse.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-body-lg leading-relaxed text-text-secondary">
              If you need help choosing a silhouette for an occasion, pairing a
              blouse with a saree, or planning a wedding-season wardrobe —
              we&rsquo;re a message away. Styling guidance is part of the
              service, not a premium add-on.
            </p>
          </Reveal>
        </EditorialBlock>
      </Section>

      <ContentCtaBlock
        eyebrow="Begin the look"
        title="Explore the latest collection."
        lede="New arrivals, festive essentials, and timeless pieces — curated for the way you live today."
        ctaLabel="Shop Women"
        ctaHref="/women"
      />
    </>
  );
}
