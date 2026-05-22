import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { AudienceTiles } from '@/components/home/AudienceTiles';
import { WomenFeatured } from '@/components/home/WomenFeatured';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandStory } from '@/components/home/BrandStory';
import { TryOnTeaser } from '@/components/home/TryOnTeaser';
import { TrustStrip } from '@/components/layout/TrustStrip';
import { Testimonials } from '@/components/home/Testimonials';
import { Lookbook } from '@/components/home/Lookbook';
import { Newsletter } from '@/components/home/Newsletter';
import { listSiteImages } from '@/lib/repositories/site-imagery';

export const metadata: Metadata = {
  title: { absolute: 'Sakthi Trends USA — Premium Ethnic Fashion' },
  description:
    'A premium boutique of hand-embroidered sarees, kurthis, lehengas, and ethnic essentials for women, men, and kids — finished with care for the modern wardrobe.',
};

export default async function HomePage() {
  // Fetch the two editorial slots used by client components in one round-trip;
  // the other server-component sections (AudienceTiles, WomenFeatured, Lookbook)
  // self-fetch their own slots.
  const editorialSlots = await listSiteImages(['brand_story', 'tryon_teaser']);
  const brandStory = editorialSlots.brand_story;
  const tryOn = editorialSlots.tryon_teaser;

  return (
    <>
      <Hero />
      <AudienceTiles />
      <WomenFeatured />
      <FeaturedProducts />
      <BrandStory
        imageUrl={brandStory.url ?? undefined}
        imageAlt={brandStory.alt ?? undefined}
      />
      <TryOnTeaser
        imageUrl={tryOn.url ?? undefined}
        imageAlt={tryOn.alt ?? undefined}
      />
      <TrustStrip />
      <Testimonials />
      <Lookbook />
      <Newsletter />
    </>
  );
}
