import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs, type Crumb } from '@/components/catalog/Breadcrumbs';
import { Reveal } from '@/components/motion/Reveal';
import { getPublishedContentPage } from '@/lib/repositories/content';
import { siteConfig } from '@/lib/site/config';

interface PageProps {
  params: { slug: string };
}

// Always read the latest published row — content can change between requests
// without a redeploy, so we opt out of static rendering.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = await getPublishedContentPage(params.slug);
  if (!page) {
    return { title: 'Not found', robots: { index: false } };
  }
  const title = page.metaTitle || page.title;
  const description = page.metaDescription || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/journal/${page.slug}`,
      type: 'article',
    },
  };
}

export default async function JournalPage({ params }: PageProps) {
  const page = await getPublishedContentPage(params.slug);
  if (!page) notFound();

  const breadcrumbs: Crumb[] = [
    { label: 'Home', href: '/' },
    // No /journal index yet — keep the label as a non-link breadcrumb segment.
    { label: 'Journal' },
    { label: page.title },
  ];

  return (
    <Container width="text" className="pb-24 pt-6 md:pb-32 md:pt-10 lg:pt-14">
      <Breadcrumbs items={breadcrumbs} className="mb-8 md:mb-10" />
      <Reveal as="header" className="mb-10 md:mb-14">
        <p className="eyebrow text-accent-ember">The Sakthi Journal</p>
        <h1 className="mt-3 text-h1 font-medium leading-tight text-text-primary md:text-display">
          {page.title}
        </h1>
      </Reveal>

      <article className="space-y-6 text-body-lg leading-relaxed text-text-secondary">
        {page.body.length === 0 ? (
          <p className="text-text-muted">This page is empty.</p>
        ) : (
          page.body.map((block, i) => {
            if (block.type === 'paragraph') {
              return (
                <p key={i} className="whitespace-pre-line">
                  {block.text}
                </p>
              );
            }
            if (block.type === 'heading') {
              const Heading = block.level === 3 ? 'h3' : 'h2';
              return (
                <Heading
                  key={i}
                  className={
                    block.level === 3
                      ? 'mt-10 text-h3 font-medium text-text-primary'
                      : 'mt-12 text-h2 font-medium text-text-primary'
                  }
                >
                  {block.text}
                </Heading>
              );
            }
            // image
            return (
              <figure
                key={i}
                className="relative my-8 aspect-[3/2] w-full overflow-hidden bg-bg-muted"
              >
                <Image
                  src={block.src}
                  alt={block.alt}
                  fill
                  sizes="(min-width: 1024px) 720px, 100vw"
                  unoptimized={block.src.includes('supabase.co')}
                  className="object-cover"
                />
              </figure>
            );
          })
        )}
      </article>
    </Container>
  );
}
