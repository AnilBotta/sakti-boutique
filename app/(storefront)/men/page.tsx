import type { Metadata } from 'next';
import { CollectionHeader } from '@/components/catalog/CollectionHeader';
import { SubcategoryRail } from '@/components/catalog/SubcategoryRail';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { taxonomy } from '@/lib/catalog/taxonomy';
import { listProducts } from '@/lib/repositories/catalog';
import { listCategoryBannerImages } from '@/lib/catalog/category-imagery.server';
import { getSiteImage } from '@/lib/repositories/site-imagery';

export const metadata: Metadata = {
  title: 'Men',
  description:
    'Cotton kurthas, festive sets, and considered ethnic essentials cut for the modern silhouette.',
};

export default async function MenLandingPage() {
  const node = taxonomy.men;
  const [banners, products, heroSlot] = await Promise.all([
    listCategoryBannerImages('men', node.categories),
    listProducts({ audience: 'men', limit: 48 }),
    getSiteImage('landing_hero_men'),
  ]);
  const heroImage = heroSlot.url ?? node.heroImage;
  const items = node.categories.map((c) => ({
    label: c.label,
    href: `/men/${c.slug}`,
    image: banners[c.slug]?.src ?? '',
  }));

  return (
    <>
      <CollectionHeader
        eyebrow={node.tagline}
        title="The Men's Edit"
        description={node.description}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Men' }]}
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
