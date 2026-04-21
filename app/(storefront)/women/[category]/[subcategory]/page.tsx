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
  return taxonomy.women.categories.flatMap((c) =>
    c.subcategories.map((s) => ({ category: c.slug, subcategory: s.slug })),
  );
}

export function generateMetadata({ params }: PageProps): Metadata {
  const sub = getSubcategory('women', params.category, params.subcategory);
  if (!sub) return { title: 'Women' };
  return {
    title: `${sub.label} — Women`,
    description: `Shop ${sub.label.toLowerCase()} at Sakthi Trends USA.`,
  };
}

export default function WomenSubcategoryPage({ params }: PageProps) {
  const cat = getCategory('women', params.category);
  const sub = getSubcategory('women', params.category, params.subcategory);
  if (!cat || !sub) notFound();

  const products = productsBySubcategory('women', cat.slug, sub.slug);

  const siblings = cat.subcategories.map((s) => ({
    label: s.label,
    href: `/women/${cat.slug}/${s.slug}`,
    active: s.slug === sub.slug,
  }));

  return (
    <>
      <CollectionHeader
        eyebrow={`Women · ${cat.label}`}
        title={sub.label}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Women', href: '/women' },
          { label: cat.label, href: `/women/${cat.slug}` },
          { label: sub.label },
        ]}
        siblings={siblings}
        resultCount={products.length}
      />

      <CatalogBrowser products={products} />
    </>
  );
}
