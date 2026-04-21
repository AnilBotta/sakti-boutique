'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { duration, ease } from '@/lib/motion/tokens';

/**
 * Hero section — autoplay looping background video with choreographed
 * on-mount reveal: eyebrow → headline (line-by-line) → body → CTA.
 */
export function Hero() {
  const reduced = useReducedMotion();

  const fadeRise = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? duration.fast : duration.slow,
        ease: ease.entrance,
        delay: reduced ? 0 : delay,
      },
    },
  });

  const headlineLines = ['Heirlooms,', 'styled for today.'];

  return (
    <section
      aria-label="Sakthi Trends USA — Festive Edit"
      className="relative isolate h-[calc(100vh-60px)] w-full overflow-hidden md:h-[calc(100vh-72px)] bg-[radial-gradient(ellipse_110%_110%_at_50%_45%,#7A1816_0%,#6B1513_55%,#4E0D0C_100%)]"
    >
      {/* Video layer — cinematic fade-in + subtle ambient scale (disabled on reduced motion) */}
      <motion.video
        src="/Hero%20video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ 'webkit-playsinline': 'true' } as any)}
        className="absolute inset-0 h-full w-full object-cover object-[center_top] md:object-contain md:object-center"
        initial={{ opacity: reduced ? 1 : 0.6, scale: reduced ? 1 : 1.04 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            opacity: { duration: reduced ? 0 : duration.cinematic, ease: ease.entrance },
            scale: { duration: reduced ? 0 : 6, ease: ease.standard },
          },
        }}
      />

      {/* Premium category ticker — also masks the Kling watermark */}
      <div
        className="group absolute inset-x-0 bottom-0 z-10 flex h-[64px] items-center overflow-hidden border-t border-bg-canvas/10 bg-[#4E0D0C] md:h-[84px]"
        aria-label="Sakthi Trends USA categories"
      >
        {/* Edge fades for luxury feel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#4E0D0C] to-transparent md:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#4E0D0C] to-transparent md:w-28"
        />

        <div className="flex min-w-max animate-[sakti-marquee_45s_linear_infinite] group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex min-w-max items-center"
            >
              {[
                'Sarees',
                'Kurtas',
                'Kurthis',
                'Lehengas',
                'Pyjamas',
                'Dupattas',
                'Blouses',
                'Co-ord Sets',
                'Ethnic Dresses',
                'Festive Wear',
                'Hand-Embroidered Styles',
                'Contemporary Classics',
                'Kids Ethnic Wear',
                "Men's Kurta Sets",
                'Occasion Wear',
              ].map((label) => (
                <li
                  key={`${copy}-${label}`}
                  className="flex items-center whitespace-nowrap"
                >
                  <span className="px-7 text-[12px] font-medium uppercase tracking-[0.32em] text-bg-canvas/95 md:px-10 md:text-[13px]">
                    {label}
                  </span>
                  <span aria-hidden className="text-[10px] text-bg-canvas/45">
                    ✦
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes sakti-marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[sakti-marquee_45s_linear_infinite\\] {
            animation: none !important;
          }
        }
      `}</style>

      {/* Bottom-up scrim for legibility */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
      />

      {/* Content overlay — choreographed cascade */}
      <div className="absolute inset-x-0 bottom-[64px] md:bottom-[84px]">
        <Container width="editorial" className="pb-14 md:pb-24">
          <div className="max-w-[560px]">
            <motion.p
              {...fadeRise(0.15)}
              className="eyebrow text-bg-canvas/85"
            >
              The Festive Edit · 2026
            </motion.p>

            <h1 className="mt-4 text-display font-medium leading-[1.05] tracking-tight text-bg-canvas md:text-[4.25rem]">
              {headlineLines.map((line, i) => (
                <span
                  key={line}
                  className="block overflow-hidden"
                  aria-hidden={false}
                >
                  <motion.span
                    className="block"
                    {...fadeRise(0.3 + i * 0.1)}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              {...fadeRise(0.7)}
              className="mt-5 max-w-md text-body-lg text-bg-canvas/85"
            >
              A premium boutique of hand-embroidered sarees, kurthis, and
              lehengas — sourced and finished with care for the modern wardrobe.
            </motion.p>

            <motion.div
              {...fadeRise(0.9)}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/women"
                className="inline-flex h-12 items-center rounded-md bg-accent-ember px-7 py-3 text-button font-medium uppercase tracking-[0.02em] text-bg-canvas transition-all duration-fast ease-standard hover:bg-[#b04e16] active:scale-[0.985]"
              >
                Shop Women
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center rounded-md border border-bg-canvas/70 px-7 py-3 text-button font-medium uppercase tracking-[0.02em] text-bg-canvas transition-colors duration-fast ease-standard hover:bg-bg-canvas hover:text-text-primary"
              >
                Our Story
              </Link>
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}
