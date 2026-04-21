'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';

/**
 * TryOnTeaser — receives the panel-settle handoff from BrandStory.
 * Its image appears to "arrive" as the user scrolls in, completing
 * the signature docking interaction. Mobile gets a simple fade-in.
 */
export function TryOnTeaser() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.85, 1]);

  return (
    <div ref={sectionRef}>
      <Section tone="subtle" width="editorial">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5 md:order-2">
            {/* Desktop — receives panel-settle handoff */}
            <motion.div
              style={reduced ? undefined : { scale, opacity }}
              className="relative hidden aspect-[4/5] w-full overflow-hidden rounded-lg bg-bg-canvas will-change-transform md:block"
            >
              <Image
                src="https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=1100&q=85"
                alt="Try Me virtual try-on preview"
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            {/* Mobile — simple Reveal fade */}
            <Reveal as="div" className="md:hidden">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-canvas">
                <Image
                  src="https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=1100&q=85"
                  alt="Try Me virtual try-on preview"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-7 md:order-1">
            <Reveal delay={0.05}>
              <div className="inline-flex items-center gap-2 rounded-full border border-border-hairline bg-bg-canvas px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent-ember" strokeWidth={1.5} />
                <span className="eyebrow text-text-primary">New · Try Me</span>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <h2 className="mt-5 text-h1 font-medium leading-[1.1] text-text-primary md:text-[2.75rem]">
                See how it<br />looks on you.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-md text-body-lg text-text-secondary">
                Upload a photo and preview any eligible piece on yourself in
                seconds. Your image stays private, deleted automatically after
                your session.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/women"
                  className="inline-flex h-12 items-center rounded-md bg-accent-ember px-7 text-button font-medium uppercase tracking-[0.02em] text-bg-canvas transition-all duration-fast ease-standard hover:bg-[#b04e16] active:scale-[0.985]"
                >
                  Try the Experience
                </Link>
                <Link
                  href="/about#tryon"
                  className="text-caption uppercase tracking-[0.14em] text-text-secondary transition-colors duration-fast ease-standard hover:text-accent-ember"
                >
                  Learn How It Works →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  );
}
