import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { testimonials } from '@/lib/home/placeholder-data';

export function Testimonials() {
  return (
    <Section width="editorial">
      <SectionHeading
        eyebrow="From Our Customers"
        title="Loved across the country"
        align="center"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <figure className="flex h-full flex-col rounded-lg border border-border-hairline p-8">
              <div
                aria-hidden
                className="mb-4 text-h2 leading-none text-accent-ember"
              >
                &ldquo;
              </div>
              <blockquote className="flex-1 text-body-lg leading-relaxed text-text-primary">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-border-hairline pt-4">
                <p className="eyebrow text-text-primary">{t.name}</p>
                <p className="mt-1 text-caption text-text-muted">{t.location}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
