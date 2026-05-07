import Link from 'next/link';
import { Section, SectionHeading } from '@/components/layout/Section';
import { ProductGrid } from '@/components/layout/ProductGrid';
import { Reveal } from '@/components/motion/Reveal';
import { ProductCard } from '@/components/catalog/ProductCard';
import { listProducts } from '@/lib/repositories/catalog';

export async function FeaturedProducts() {
  const all = await listProducts({ limit: 24 });
  // Curated homepage selection — first 4, with badged products surfaced first.
  const featured = all
    .slice()
    .sort((a, b) => (a.badge ? -1 : 1) - (b.badge ? -1 : 1))
    .slice(0, 4);
  return (
    <Section width="editorial">
      <div className="flex items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Curated This Week"
          title="Pieces our atelier loves"
          lede="A small, considered selection — refreshed weekly by our stylists."
          className="mb-10 md:mb-12"
        />
        <Link
          href="/women"
          className="hidden shrink-0 pb-12 text-caption uppercase tracking-[0.14em] text-text-secondary transition-colors duration-fast ease-standard hover:text-accent-ember md:inline-block"
        >
          View All →
        </Link>
      </div>

      <ProductGrid>
        {featured.map((product, i) => (
          <Reveal key={product.id} delay={i * 0.06}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </ProductGrid>

      <div className="mt-10 flex justify-center md:hidden">
        <Link
          href="/women"
          className="text-caption uppercase tracking-[0.14em] text-text-secondary"
        >
          View All →
        </Link>
      </div>
    </Section>
  );
}
