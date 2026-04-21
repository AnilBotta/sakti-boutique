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
  return taxonomy.men.categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const cat = getCategory('men', params.category);
  if (!cat) return { title: 'Men' };
  return {
    title: `${cat.label} — Men`,
    description: `Shop premium ${cat.label.toLowerCase()} for men at Sakthi Trends USA.`,
  };
}

export default function MenCategoryPage({ params }: PageProps) {
  const cat = getCategory('men', params.category);
  if (!cat) notFound();

  const products = productsByCategory('men', cat.slug);

  return (
    <>
      <CollectionHeader
        eyebrow="Men"
        title={cat.label}
        description={`Considered ${cat.label.toLowerCase()} cut for the modern silhouette.`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Men', href: '/men' },
          { label: cat.label },
        ]}
        resultCount={products.length}
      />

      <CatalogBrowser products={products} />
    </>
  );
}
