'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { duration, ease } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils/cn';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  image?: { src: string; alt: string };
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Editorial hero for static content pages (About, FAQ, Contact).
 *
 * Calmer than the homepage hero — no full-bleed image, no ambient loops.
 * A generous typographic block with an optional editorial image strip below
 * that performs a clip-path cover reveal on mount.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  align = 'left',
  className,
}: PageHeroProps) {
  const reduced = useReducedMotion();

  return (
    <section
      className={cn(
        'pt-20 pb-14 md:pt-28 md:pb-20 border-b border-border-hairline',
        className,
      )}
    >
      <Container>
        <Reveal>
          <div
            className={cn(
              'max-w-3xl',
              align === 'center' && 'mx-auto text-center',
            )}
          >
            <p className="eyebrow text-accent-ember">{eyebrow}</p>
            <h1 className="mt-4 text-[2.25rem] font-medium leading-[1.05] tracking-tight text-text-primary md:text-[3.25rem]">
              {title}
            </h1>
            {lede && (
              <p className="mt-6 max-w-2xl text-body-lg leading-relaxed text-text-secondary md:mt-8">
                {lede}
              </p>
            )}
          </div>
        </Reveal>

        {image && (
          <motion.div
            initial={
              reduced
                ? { opacity: 0 }
                : { clipPath: 'inset(100% 0 0 0)', opacity: 0.8 }
            }
            animate={
              reduced
                ? { opacity: 1, transition: { duration: duration.fast } }
                : {
                    clipPath: 'inset(0% 0 0 0)',
                    opacity: 1,
                    transition: { duration: duration.cinematic, ease: ease.entrance },
                  }
            }
            className="relative mt-10 aspect-[16/7] w-full overflow-hidden bg-bg-muted md:mt-14"
          >
            <motion.div
              initial={{ scale: reduced ? 1 : 1.04 }}
              animate={{
                scale: 1,
                transition: { duration: reduced ? 0 : 6, ease: ease.standard },
              }}
              className="absolute inset-0"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
