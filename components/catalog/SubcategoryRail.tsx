import Image from 'next/image';
import Link from 'next/link';
import { Section, SectionHeading } from '@/components/layout/Section';

interface RailItem {
  label: string;
  href: string;
  image: string;
}

interface SubcategoryRailProps {
  eyebrow?: string;
  title: string;
  lede?: string;
  items: RailItem[];
  tone?: 'canvas' | 'subtle';
}

/**
 * Reusable subcategory rail used on collection landing pages.
 * Horizontal snap on mobile, grid on desktop.
 */
export function SubcategoryRail({
  eyebrow,
  title,
  lede,
  items,
  tone = 'canvas',
}: SubcategoryRailProps) {
  if (items.length === 0) return null;

  return (
    <Section tone={tone} width="editorial">
      <SectionHeading eyebrow={eyebrow} title={title} lede={lede} />

      <div className="-mx-5 md:mx-0">
        <ul
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:grid md:gap-6 md:overflow-visible md:px-0 md:pb-0"
          style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 5)}, minmax(0, 1fr))` }}
        >
          {items.map((item) => (
            <li key={item.href} className="w-[68%] flex-shrink-0 snap-start md:w-auto">
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
                  <p className="text-body font-medium text-text-primary">{item.label}</p>
                  <span className="mt-1 inline-block text-caption text-text-muted transition-colors duration-fast ease-standard group-hover:text-accent-ember">
                    Shop →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
