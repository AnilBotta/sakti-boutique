import type { Metadata } from 'next';
import { CollectionHeader } from '@/components/catalog/CollectionHeader';
import { SubcategoryRail } from '@/components/catalog/SubcategoryRail';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { taxonomy } from '@/lib/catalog/taxonomy';
import { productsByAudience } from '@/lib/catalog/products';
import { categoryImage } from '@/lib/catalog/category-imagery';

export const metadata: Metadata = {
  title: 'Men',
  description:
    'Cotton kurthas, festive sets, and considered ethnic essentials cut for the modern silhouette.',
};

export default function MenLandingPage() {
  const node = taxonomy.men;
  const items = node.categories.map((c) => ({
    label: c.label,
    href: `/men/${c.slug}`,
    image: categoryImage('men', c.slug),
  }));
  const products = productsByAudience('men');

  return (
    <>
      <CollectionHeader
        eyebrow={node.tagline}
        title="The Men's Edit"
        description={node.description}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Men' }]}
        bannerImage={node.heroImage}
      />

      <SubcategoryRail
        eyebrow="Browse"
        title="Categories"
        items={items}
      />

      <CatalogBrowser products={products} />
    </>
  );
}
