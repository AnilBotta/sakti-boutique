import Image from 'next/image';
import Link from 'next/link';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { womenFeatured } from '@/lib/home/placeholder-data';

export function WomenFeatured() {
  return (
    <Section tone="subtle" width="editorial">
      <SectionHeading
        eyebrow="The Women's House"
        title="Featured silhouettes"
        lede="From everyday kurthis to wedding-day lehengas — five categories, each with its own quiet character."
      />

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="-mx-5 md:mx-0">
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:grid md:grid-cols-5 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {womenFeatured.map((item, i) => (
            <li
              key={item.label}
              className="w-[68%] flex-shrink-0 snap-start md:w-auto"
            >
              <Reveal delay={i * 0.06}>
                <Link href={item.href} className="group block">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-canvas">
                    <Image
                      src={item.image}
                      alt={item.label}
                      fill
                      sizes="(min-width: 768px) 18vw, 70vw"
                      className="object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-body font-medium text-text-primary">
                      {item.label}
                    </p>
                    <span className="mt-1 inline-block text-caption text-text-muted transition-colors duration-fast ease-standard group-hover:text-accent-ember">
                      Shop →
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
