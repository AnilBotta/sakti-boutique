import type { Product } from '@/lib/catalog/products';
import { Section, SectionHeading } from '@/components/layout/Section';
import { ProductGrid } from '@/components/layout/ProductGrid';
import { ProductCard } from '@/components/catalog/ProductCard';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;
  return (
    <Section>
      <SectionHeading eyebrow="You may also like" title="From the same atelier" />
      <ProductGrid>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ProductGrid>
    </Section>
  );
}
