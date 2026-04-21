import type { Metadata } from 'next';
import { CollectionHeader } from '@/components/catalog/CollectionHeader';
import { SubcategoryRail } from '@/components/catalog/SubcategoryRail';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { taxonomy } from '@/lib/catalog/taxonomy';
import { productsByAudience } from '@/lib/catalog/products';
import { categoryImage } from '@/lib/catalog/category-imagery';

export const metadata: Metadata = {
  title: 'Women',
  description:
    "Hand-embroidered sarees, kurthis, lehengas and more — premium ethnic wear for women, finished with care.",
};

export default function WomenLandingPage() {
  const node = taxonomy.women;
  const items = node.categories.map((c) => ({
    label: c.label,
    href: `/women/${c.slug}`,
    image: categoryImage('women', c.slug),
  }));
  const products = productsByAudience('women');

  return (
    <>
      <CollectionHeader
        eyebrow={node.tagline}
        title="The Women's House"
        description={node.description}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Women' }]}
        bannerImage={node.heroImage}
      />

      <SubcategoryRail
        eyebrow="Browse"
        title="Featured silhouettes"
        lede="Five categories, each with its own quiet character."
        items={items}
        tone="subtle"
      />

      <CatalogBrowser products={products} />
    </>
  );
}
