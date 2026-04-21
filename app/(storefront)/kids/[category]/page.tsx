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
  return taxonomy.kids.categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const cat = getCategory('kids', params.category);
  if (!cat) return { title: 'Kids' };
  return {
    title: `${cat.label} — Kids`,
    description: `Shop ${cat.label.toLowerCase()} for kids at Sakthi Trends USA.`,
  };
}

export default function KidsCategoryPage({ params }: PageProps) {
  const cat = getCategory('kids', params.category);
  if (!cat) notFound();

  const products = productsByCategory('kids', cat.slug);

  const siblings = cat.subcategories.length
    ? cat.subcategories.map((s) => ({
        label: s.label,
        href: `/kids/${cat.slug}/${s.slug}`,
      }))
    : undefined;

  return (
    <>
      <CollectionHeader
        eyebrow="Kids"
        title={cat.label}
        description={`Soft and easy ${cat.label.toLowerCase()} for little ones.`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Kids', href: '/kids' },
          { label: cat.label },
        ]}
        siblings={siblings}
        resultCount={products.length}
      />

      <CatalogBrowser products={products} />
    </>
  );
}
