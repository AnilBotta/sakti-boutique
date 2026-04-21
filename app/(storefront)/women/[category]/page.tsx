import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionHeader } from '@/components/catalog/CollectionHeader';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { taxonomy, getCategory } from '@/lib/catalog/taxonomy';
import { productsByCategory } from '@/lib/catalog/products';

interface PageProps {
  params: { category: string };
}

export function generateStaticParams() {
  return taxonomy.women.categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const cat = getCategory('women', params.category);
  if (!cat) return { title: 'Women' };
  return {
    title: `${cat.label} — Women`,
    description: `Shop premium ${cat.label.toLowerCase()} for women at Sakthi Trends USA.`,
  };
}

export default function WomenCategoryPage({ params }: PageProps) {
  const cat = getCategory('women', params.category);
  if (!cat) notFound();

  const products = productsByCategory('women', cat.slug);

  const siblings = cat.subcategories.length
    ? cat.subcategories.map((s) => ({
        label: s.label,
        href: `/women/${cat.slug}/${s.slug}`,
      }))
    : undefined;

  return (
    <>
      <CollectionHeader
        eyebrow="Women"
        title={cat.label}
        description={`Hand-finished ${cat.label.toLowerCase()} from our atelier.`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Women', href: '/women' },
          { label: cat.label },
        ]}
        siblings={siblings}
        resultCount={products.length}
      />

      <CatalogBrowser products={products} />
    </>
  );
}
