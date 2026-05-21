import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { listReviews } from '@/lib/repositories/reviews';
import { ReviewsClient } from './ReviewsClient';

export default async function AdminReviewsPage() {
  const reviews = await listReviews(100);
  return (
    <AdminScaffoldPage
      eyebrow="Commerce"
      title="Reviews"
      description="Approve, reject, or hide reviews. Approved reviews appear on the product page."
    >
      <ReviewsClient initialReviews={reviews} />
    </AdminScaffoldPage>
  );
}
