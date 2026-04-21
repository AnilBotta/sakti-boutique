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

export const metadata: Metadata = {
  title: { absolute: 'Sakthi Trends USA — Premium Ethnic Fashion' },
  description:
    'A premium boutique of hand-embroidered sarees, kurthis, lehengas, and ethnic essentials for women, men, and kids — finished with care for the modern wardrobe.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <AudienceTiles />
      <WomenFeatured />
      <FeaturedProducts />
      <BrandStory />
      <TryOnTeaser />
      <TrustStrip />
      <Testimonials />
      <Lookbook />
      <Newsletter />
    </>
  );
}
