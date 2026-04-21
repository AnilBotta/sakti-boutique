import type { ReactNode } from 'react';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils/cn';

interface RichTextSectionProps {
  eyebrow?: string;
  title: ReactNode;
  children: ReactNode;
  tone?: 'canvas' | 'subtle';
  width?: 'default' | 'editorial' | 'text';
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Editorial text block used inside long-form content pages. Keeps prose
 * in a narrow measure (~64ch) for readability, same rhythm as the rest of
 * the storefront.
 */
export function RichTextSection({
  eyebrow,
  title,
  children,
  tone = 'canvas',
  width = 'text',
  align = 'left',
  className,
}: RichTextSectionProps) {
  return (
    <Section tone={tone} width={width} className={className}>
      <Reveal>
        <SectionHeading eyebrow={eyebrow} title={title} align={align} />
      </Reveal>
      <Reveal delay={0.05}>
        <div
          className={cn(
            'prose-content flex flex-col gap-5 text-body-lg leading-relaxed text-text-secondary',
            align === 'center' && 'mx-auto text-center',
          )}
        >
          {children}
        </div>
      </Reveal>
    </Section>
  );
}
