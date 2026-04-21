import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs, type Crumb } from '@/components/catalog/Breadcrumbs';
import { Reveal } from '@/components/motion/Reveal';
import { ProductGallery } from '@/components/pdp/ProductGallery';
import { PurchasePanel } from '@/components/pdp/PurchasePanel';
import { ProductAccordion } from '@/components/pdp/ProductAccordion';
import { TryMeBlock } from '@/components/pdp/TryMeBlock';
import { RelatedProducts } from '@/components/pdp/RelatedProducts';
import { ProductJsonLd } from '@/components/pdp/ProductJsonLd';
import { products } from '@/lib/catalog/products';
import {
  getProductDetails,
  getRelatedProducts,
} from '@/lib/catalog/product-details';
import { getCategory, getSubcategory } from '@/lib/catalog/taxonomy';
import { siteConfig } from '@/lib/site/config';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const product = getProductDetails(params.slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.map((url) => ({ url })),
    },
  };
}

export default function ProductPage({ params }: PageProps) {
  const product = getProductDetails(params.slug);
  if (!product) notFound();

  const audienceLabel =
    product.audience === 'women' ? 'Women' : product.audience === 'men' ? 'Men' : 'Kids';
  const cat = getCategory(product.audience, product.category);
  const sub = product.subcategory
    ? getSubcategory(product.audience, product.category, product.subcategory)
    : null;

  const breadcrumbs: Crumb[] = [
    { label: 'Home', href: '/' },
    { label: audienceLabel, href: `/${product.audience}` },
    ...(cat
      ? [{ label: cat.label, href: `/${product.audience}/${cat.slug}` }]
      : []),
    ...(sub && cat
      ? [
          {
            label: sub.label,
            href: `/${product.audience}/${cat.slug}/${sub.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  const eyebrow = [audienceLabel, cat?.label].filter(Boolean).join(' · ');
  const related = getRelatedProducts(product, 4);
  const url = `${siteConfig.url}/p/${product.slug}`;

  return (
    <>
      {/* Editorial-width wrapper; extra bottom padding on mobile so the sticky
          CTA bar never overlaps the accordion. */}
      <Container width="editorial" className="pb-32 pt-6 md:pb-20 md:pt-10 lg:pt-12">
        <Breadcrumbs items={breadcrumbs} className="mb-8 md:mb-10" />

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal as="div" className="lg:col-span-7">
            <ProductGallery images={product.images} alt={product.name} />
          </Reveal>

          <Reveal
            as="div"
            delay={0.08}
            className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start"
          >
            <PurchasePanel product={product} eyebrow={eyebrow} />
          </Reveal>
        </div>

        <div className="mt-16 md:mt-24 lg:mt-28 lg:grid lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8 lg:col-start-1">
            <ProductAccordion product={product} />
          </div>
        </div>
      </Container>

      {product.tryOnEligible && <TryMeBlock />}

      <RelatedProducts products={related} />

      <ProductJsonLd product={product} breadcrumbs={breadcrumbs} url={url} />
    </>
  );
}
