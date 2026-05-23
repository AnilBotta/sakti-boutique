'use client';

import { useState, useTransition } from 'react';
import { Star, Check, X, EyeOff } from 'lucide-react';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import type { ReviewRow } from '@/lib/admin/mock-data';
import { setReviewStatusAction } from '@/lib/actions/admin-reviews';

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < n ? 'text-accent-saffron' : 'text-border-default'
          }`}
          strokeWidth={1.5}
          fill={i < n ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}

interface Props {
  initialReviews: ReviewRow[];
}

export function ReviewsClient({ initialReviews }: Props) {
  const [reviews, setReviews] = useState<ReviewRow[]>(initialReviews);
  const [, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pending = reviews.filter((r) => r.status === 'pending');

  function setStatus(id: string, status: 'approved' | 'rejected' | 'hidden') {
    // Optimistic update
    const uiStatus: ReviewRow['status'] = status === 'approved' ? 'approved' : 'hidden';
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: uiStatus } : r)),
    );
    setPendingId(id);
    startTransition(async () => {
      const res = await setReviewStatusAction(id, status);
      setPendingId(null);
      if (!res.ok) {
        // Rollback
        setReviews(initialReviews);
        alert(res.message ?? 'Could not update review');
      }
    });
  }

  return (
    <>
      <AdminSectionCard
        title="Pending Moderation"
        description={`${pending.length} awaiting action`}
        bodyClassName="p-0"
      >
        {pending.length === 0 ? (
          <p className="px-6 py-12 text-center text-caption text-text-muted">
            Inbox zero — all reviews moderated.
          </p>
        ) : (
          <ul className="divide-y divide-border-hairline">
            {pending.map((r) => {
              const busy = pendingId === r.id;
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-body font-medium text-text-primary">
                        {r.product}
                      </p>
                      <Stars n={r.rating} />
                    </div>
                    <p className="mt-2 text-caption text-text-muted">
                      {r.author} · {r.submittedAt}
                    </p>
                    <p className="mt-3 text-body text-text-secondary">
                      &ldquo;{r.excerpt}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(r.id, 'approved')}
                      disabled={busy}
                      className="inline-flex h-9 items-center gap-1 border border-state-success/40 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-state-success hover:bg-bg-subtle disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(r.id, 'hidden')}
                      disabled={busy}
                      className="inline-flex h-9 items-center gap-1 border border-border-default px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary hover:bg-bg-subtle disabled:opacity-40"
                    >
                      <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Hide
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(r.id, 'rejected')}
                      disabled={busy}
                      className="inline-flex h-9 items-center gap-1 border border-accent-crimson/40 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-crimson hover:bg-bg-subtle disabled:opacity-40"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Reject
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="All reviews"
        description={reviews.length === 0 ? undefined : `${reviews.length} total`}
        bodyClassName="p-0"
      >
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
            <p className="text-body text-text-secondary">No reviews yet.</p>
            <p className="text-caption text-text-muted">
              Customer reviews submitted from a product page will appear here
              for moderation.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border-hairline">
            {reviews.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-6 py-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-body font-medium text-text-primary">
                    {r.product}
                  </p>
                  <p className="truncate text-caption text-text-muted">
                    {r.author} · {r.excerpt}
                  </p>
                </div>
                <Stars n={r.rating} />
                <AdminStatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </AdminSectionCard>
    </>
  );
}
