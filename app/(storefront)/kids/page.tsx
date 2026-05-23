import type { Metadata } from 'next';
import { CollectionHeader } from '@/components/catalog/CollectionHeader';
import { SubcategoryRail } from '@/components/catalog/SubcategoryRail';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { taxonomy } from '@/lib/catalog/taxonomy';
import { listProducts } from '@/lib/repositories/catalog';
import { listCategoryBannerImages } from '@/lib/catalog/category-imagery.server';
import { getSiteImage } from '@/lib/repositories/site-imagery';

export const metadata: Metadata = {
  title: 'Kids',
  description:
    'Soft cottons, easy fits, and festive sets crafted for everyday celebration.',
};

export default async function KidsLandingPage() {
  const node = taxonomy.kids;
  const [banners, products, heroSlot] = await Promise.all([
    listCategoryBannerImages('kids', node.categories),
    listProducts({ audience: 'kids', limit: 48 }),
    getSiteImage('landing_hero_kids'),
  ]);
  const heroImage = heroSlot.url ?? node.heroImage;
  const items = node.categories.map((c) => ({
    label: c.label,
    href: `/kids/${c.slug}`,
    image: banners[c.slug]?.src ?? '',
  }));

  return (
    <>
      <CollectionHeader
        eyebrow={node.tagline}
        title="Festive Little Ones"
        description={node.description}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Kids' }]}
        bannerImage={heroImage}
        bannerUnoptimized={!!heroSlot.url}
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
