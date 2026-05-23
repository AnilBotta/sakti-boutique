import { getProductReviews } from '@/lib/repositories/reviews';
import { Stars } from './Stars';
import { ReviewForm } from './ReviewForm';

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * PDP reviews section. Server component — pulls approved reviews + summary
 * from Supabase, renders the average-rating header, lists each review, and
 * mounts the (client) submission form below.
 */
export async function ProductReviews({
  productId,
  productSlug,
}: ProductReviewsProps) {
  const summary = await getProductReviews(productId, 20);

  return (
    <section className="mt-16 border-t border-border-hairline pt-12 md:mt-24 md:pt-16">
      <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
        <div>
          <p className="eyebrow text-accent-ember">Reviews</p>
          <h2 className="mt-2 text-h2 font-medium text-text-primary">
            What customers are saying
          </h2>
        </div>
        {summary.count > 0 && (
          <div className="flex items-center gap-3">
            <Stars value={summary.average} sizeClass="h-5 w-5" />
            <p className="text-body text-text-secondary nums-tabular">
              <span className="font-medium text-text-primary">
                {summary.average.toFixed(1)}
              </span>{' '}
              · {summary.count}{' '}
              {summary.count === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        )}
      </header>

      {summary.reviews.length === 0 ? (
        <div className="border border-border-hairline px-6 py-10 text-center">
          <p className="text-body text-text-secondary">
            No reviews yet — be the first to share your experience.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border-hairline border-y border-border-hairline">
          {summary.reviews.map((r) => (
            <li key={r.id} className="py-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-body font-medium text-text-primary">
                  {r.author}
                </p>
                <Stars value={r.rating} sizeClass="h-3.5 w-3.5" />
              </div>
              {r.title && (
                <p className="mt-2 text-body-lg font-medium text-text-primary">
                  {r.title}
                </p>
              )}
              <p className="mt-2 whitespace-pre-line text-body text-text-secondary">
                {r.body}
              </p>
              <p className="mt-3 text-caption text-text-muted">
                {formatDate(r.submittedAt)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <ReviewForm productId={productId} productSlug={productSlug} />
      </div>
    </section>
  );
}
