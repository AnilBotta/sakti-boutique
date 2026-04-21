import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionHeader } from '@/components/catalog/CollectionHeader';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { taxonomy, getCategory, getSubcategory } from '@/lib/catalog/taxonomy';
import { productsBySubcategory } from '@/lib/catalog/products';

interface PageProps {
  params: { category: string; subcategory: string };
}

export function generateStaticParams() {
  return taxonomy.kids.categories.flatMap((c) =>
    c.subcategories.map((s) => ({ category: c.slug, subcategory: s.slug })),
  );
}

export function generateMetadata({ params }: PageProps): Metadata {
  const sub = getSubcategory('kids', params.category, params.subcategory);
  if (!sub) return { title: 'Kids' };
  return {
    title: `${sub.label} — Kids`,
    description: `Shop ${sub.label.toLowerCase()} for kids at Sakthi Trends USA.`,
  };
}

export default function KidsSubcategoryPage({ params }: PageProps) {
  const cat = getCategory('kids', params.category);
  const sub = getSubcategory('kids', params.category, params.subcategory);
  if (!cat || !sub) notFound();

  const products = productsBySubcategory('kids', cat.slug, sub.slug);

  const siblings = cat.subcategories.map((s) => ({
    label: s.label,
    href: `/kids/${cat.slug}/${s.slug}`,
    active: s.slug === sub.slug,
  }));

  return (
    <>
      <CollectionHeader
        eyebrow={`Kids · ${cat.label}`}
        title={sub.label}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Kids', href: '/kids' },
          { label: cat.label, href: `/kids/${cat.slug}` },
          { label: sub.label },
        ]}
        siblings={siblings}
        resultCount={products.length}
      />

      <CatalogBrowser products={products} />
    </>
  );
}
