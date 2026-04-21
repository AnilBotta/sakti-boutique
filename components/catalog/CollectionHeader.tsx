import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import { cn } from '@/lib/utils/cn';

interface SiblingLink {
  label: string;
  href: string;
  active?: boolean;
}

interface CollectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs: Crumb[];
  bannerImage?: string;
  resultCount?: number;
  siblings?: SiblingLink[];
  children?: ReactNode;
}

/**
 * Reusable header for landing, category, and subcategory pages.
 * - With `bannerImage`: cinematic banner with overlaid copy.
 * - Without: editorial header on white canvas.
 */
export function CollectionHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  bannerImage,
  resultCount,
  siblings,
  children,
}: CollectionHeaderProps) {
  if (bannerImage) {
    return (
      <header className="relative isolate overflow-hidden">
        <div className="relative h-[52vh] min-h-[420px] w-full md:h-[60vh] md:min-h-[520px]">
          <Image
            src={bannerImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <Container width="editorial" className="pb-12 md:pb-20">
            <div className="max-w-[640px] text-bg-canvas">
              <Breadcrumbs items={breadcrumbs} className="mb-6 [&_*]:text-bg-canvas/85 [&_[aria-current=page]]:text-bg-canvas" />
              {eyebrow && <p className="eyebrow text-bg-canvas/85">{eyebrow}</p>}
              <h1 className="mt-3 text-display font-medium leading-[1.05] tracking-tight md:text-[4rem]">
                {title}
              </h1>
              {description && (
                <p className="mt-4 max-w-md text-body-lg text-bg-canvas/85">
                  {description}
                </p>
              )}
            </div>
          </Container>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border-hairline pt-10 pb-10 md:pt-14 md:pb-14">
      <Container width="editorial">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />
        {eyebrow && <p className="eyebrow text-accent-ember">{eyebrow}</p>}
        <h1 className="mt-3 text-h1 font-medium leading-[1.1] text-text-primary md:text-[2.5rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-body text-text-secondary">
            {description}
          </p>
        )}

        {siblings && siblings.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {siblings.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className={cn(
                    'inline-flex h-9 items-center rounded-md border px-4 text-caption uppercase tracking-[0.14em] transition-colors duration-fast ease-standard',
                    s.active
                      ? 'border-accent-ember bg-bg-muted text-accent-ember'
                      : 'border-border-hairline text-text-secondary hover:text-text-primary',
                  )}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {(resultCount != null || children) && (
          <div className="mt-8 flex items-center justify-between gap-4">
            {resultCount != null && (
              <p className="text-caption text-text-muted nums-tabular">
                {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
              </p>
            )}
            {children}
          </div>
        )}
      </Container>
    </header>
  );
}
