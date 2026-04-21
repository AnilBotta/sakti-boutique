import type { ProductDetails } from '@/lib/catalog/product-details';
import type { Crumb } from '@/components/catalog/Breadcrumbs';
import { siteConfig } from '@/lib/site/config';

interface ProductJsonLdProps {
  product: ProductDetails;
  breadcrumbs: Crumb[];
  url: string;
}

export function ProductJsonLd({ product, breadcrumbs, url }: ProductJsonLdProps) {
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Sakthi Trends USA' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: c.href ? `${siteConfig.url}${c.href}` : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
