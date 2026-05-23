import { Section, SectionHeading } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { Stars } from '@/components/pdp/reviews/Stars';
import { listFeaturedApprovedReviews } from '@/lib/repositories/reviews';

/**
 * "Loved across the country" homepage block. Pulls the top approved reviews
 * (highest rating first, then newest) from Supabase. Hides itself entirely
 * when nothing is approved yet — keeps the homepage honest, no fake quotes.
 */
export async function Testimonials() {
  const reviews = await listFeaturedApprovedReviews(3);
  if (reviews.length === 0) return null;

  return (
    <Section width="editorial">
      <SectionHeading
        eyebrow="From Our Customers"
        title="Loved across the country"
        align="center"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {reviews.map((r, i) => (
          <Reveal key={r.id} delay={i * 0.08}>
            <figure className="flex h-full flex-col rounded-lg border border-border-hairline p-8">
              <div
                aria-hidden
                className="mb-4 text-h2 leading-none text-accent-ember"
              >
                &ldquo;
              </div>
              <Stars value={r.rating} sizeClass="h-3.5 w-3.5" className="mb-3" />
              {r.title && (
                <p className="mb-2 text-body-lg font-medium text-text-primary">
                  {r.title}
                </p>
              )}
              <blockquote className="flex-1 text-body-lg leading-relaxed text-text-primary">
                {r.body}
              </blockquote>
              <figcaption className="mt-6 border-t border-border-hairline pt-4">
                <p className="eyebrow text-text-primary">{r.author}</p>
                {r.productName && (
                  <p className="mt-1 text-caption text-text-muted">
                    on the {r.productName}
                  </p>
                )}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
