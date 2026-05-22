import type { Metadata } from 'next';
import { CollectionHeader } from '@/components/catalog/CollectionHeader';
import { SubcategoryRail } from '@/components/catalog/SubcategoryRail';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { taxonomy } from '@/lib/catalog/taxonomy';
import { listProducts } from '@/lib/repositories/catalog';
import { categoryImage } from '@/lib/catalog/category-imagery';

export const metadata: Metadata = {
  title: 'Kids',
  description:
    'Soft cottons, easy fits, and festive sets crafted for everyday celebration.',
};

export default async function KidsLandingPage() {
  const node = taxonomy.kids;
  const items = node.categories.map((c) => ({
    label: c.label,
    href: `/kids/${c.slug}`,
    image: categoryImage('kids', c.slug),
  }));
  const products = await listProducts({ audience: 'kids', limit: 48 });

  return (
    <>
      <CollectionHeader
        eyebrow={node.tagline}
        title="Festive Little Ones"
        description={node.description}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Kids' }]}
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
