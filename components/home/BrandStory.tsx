'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { EditorialBlock } from '@/components/layout/EditorialBlock';
import { Reveal } from '@/components/motion/Reveal';

/**
 * BrandStory — signature panel-settle interaction.
 * As the user scrolls past this section, its image scales down and
 * translates toward the next section's image slot, creating the
 * illusion that the panel "docks" into TryOnTeaser.
 * Desktop-only; mobile gets a simple fade-in via <Reveal>.
 */
export function BrandStory() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Only apply these on the motion element (desktop paints them inline;
  // mobile-side suppression handled via a hidden wrapper class).
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const borderRadius = useTransform(scrollYProgress, [0, 1], ['0px', '10px']);
  const opacity = useTransform(scrollYProgress, [0.85, 1], [1, 0.4]);

  return (
    <div ref={sectionRef}>
      <Section width="editorial">
        <EditorialBlock
          media={
            <>
              {/* Desktop — panel-settle enabled */}
              <motion.div
                style={
                  reduced
                    ? undefined
                    : { scale, y, borderRadius, opacity }
                }
                className="relative hidden aspect-[4/5] w-full overflow-hidden bg-bg-muted will-change-transform md:block"
              >
                <Image
                  src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1400&q=85"
                  alt="Hand embroidery in progress at the Sakthi atelier"
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
              {/* Mobile — simple fade-in */}
              <Reveal as="div" className="md:hidden">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1400&q=85"
                    alt="Hand embroidery in progress at the Sakthi atelier"
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </>
          }
        >
          <Reveal delay={0.1}>
            <p className="eyebrow text-accent-ember">Our Atelier</p>
            <h2 className="mt-3 text-h1 font-medium leading-[1.1] text-text-primary md:text-[2.75rem]">
              Slow craft.<br />Modern soul.
            </h2>
            <p className="mt-5 max-w-md text-body-lg text-text-secondary">
              Sakthi began as a love letter to the women in our family — the ones
              who pinned dupattas before festivals and taught us that thread can
              hold memory. Every piece is hand-finished by artisans we know by
              name, then styled for the way you actually live now.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-block border-b border-accent-ember pb-1 text-caption uppercase tracking-[0.14em] text-accent-ember transition-colors duration-fast ease-standard hover:text-text-primary hover:border-text-primary"
            >
              Read Our Story →
            </Link>
          </Reveal>
        </EditorialBlock>
      </Section>
    </div>
  );
}
