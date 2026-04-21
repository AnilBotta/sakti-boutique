import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils/cn';

interface ContentCtaBlockProps {
  eyebrow?: string;
  title: string;
  lede?: string;
  ctaLabel: string;
  ctaHref: string;
  tone?: 'canvas' | 'subtle';
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Editorial CTA band used at the foot of long-form content pages. Routes
 * visitors back into the shopping journey or deeper support surfaces.
 * Uses `Section` for consistent rhythm; tone `subtle` is available but
 * should not be used more than once per page.
 */
export function ContentCtaBlock({
  eyebrow,
  title,
  lede,
  ctaLabel,
  ctaHref,
  tone = 'subtle',
  align = 'center',
  className,
}: ContentCtaBlockProps) {
  return (
    <Section tone={tone} className={className}>
      <div
        className={cn(
          'mx-auto flex max-w-2xl flex-col gap-5',
          align === 'center' && 'items-center text-center',
        )}
      >
        <Reveal>
          {eyebrow && (
            <p className="eyebrow text-accent-ember">{eyebrow}</p>
          )}
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="text-[1.75rem] font-medium leading-tight text-text-primary md:text-[2.25rem]">
            {title}
          </h2>
        </Reveal>
        {lede && (
          <Reveal delay={0.1}>
            <p className="max-w-xl text-body-lg text-text-secondary">{lede}</p>
          </Reveal>
        )}
        <Reveal delay={0.15}>
          <Link
            href={ctaHref}
            className="mt-2 inline-flex h-12 items-center justify-center gap-2 bg-accent-ember px-7 text-button font-medium uppercase tracking-[0.02em] text-bg-canvas transition-all duration-fast ease-standard hover:bg-[#b04e16] active:scale-[0.985]"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
