import Image from 'next/image';
import Link from 'next/link';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { audienceTiles } from '@/lib/home/placeholder-data';

export function AudienceTiles() {
  return (
    <Section width="editorial">
      <SectionHeading
        eyebrow="Shop the House"
        title="Three collections, one atelier"
        lede="Every piece is curated to feel modern, festive, and unmistakably Sakthi."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {audienceTiles.map((tile, i) => (
          <Reveal key={tile.label} delay={i * 0.08}>
            <Link
              href={tile.href}
              className="group relative block overflow-hidden"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-muted">
                <Image
                  src={tile.image}
                  alt={`${tile.label} collection`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 transition-transform duration-base ease-standard group-hover:-translate-y-1 md:p-8">
                <p className="eyebrow text-bg-canvas/85">{tile.eyebrow}</p>
                <h3 className="mt-2 text-h2 font-medium text-bg-canvas">
                  {tile.label}
                </h3>
                <span className="mt-3 inline-block text-caption uppercase tracking-[0.14em] text-bg-canvas/85 transition-colors duration-fast ease-standard group-hover:text-bg-canvas">
                  Explore →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
