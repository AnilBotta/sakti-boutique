import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Container } from './Container';

type Tone = 'canvas' | 'subtle';
type Width = 'default' | 'editorial' | 'text';

interface SectionProps {
  id?: string;
  tone?: Tone;
  width?: Width;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}

/**
 * Section wrapper that enforces premium vertical rhythm:
 *   mobile py-14 → py-18, desktop py-24 → py-32.
 * `tone="subtle"` switches to warm off-white background — use sparingly,
 * never more than one alternating subtle section per page.
 */
export function Section({
  id,
  tone = 'canvas',
  width = 'default',
  className,
  innerClassName,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-14 md:py-24 lg:py-32',
        tone === 'subtle' && 'bg-bg-subtle',
        className,
      )}
    >
      <Container width={width} className={innerClassName}>
        {children}
      </Container>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  lede?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={cn(
        'mb-10 md:mb-16 max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && <p className="eyebrow mb-3 text-accent-ember">{eyebrow}</p>}
      <h2 className="text-h2 md:text-[2.25rem] font-medium text-text-primary">{title}</h2>
      {lede && <p className="mt-4 text-body text-text-secondary">{lede}</p>}
    </header>
  );
}
