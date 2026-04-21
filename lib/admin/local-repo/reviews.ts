'use client';

import {
  readCollection,
  writeCollection,
  useCollection,
} from '@/lib/admin/local-store';
import { reviewQueue, type ReviewRow, type ReviewStatus } from '@/lib/admin/mock-data';

const COLLECTION = 'reviews';

const seed = (): ReviewRow[] => reviewQueue.map((r) => ({ ...r }));

export function useAdminReviews(): [
  ReviewRow[],
  {
    setStatus: (id: string, status: ReviewStatus) => void;
  },
] {
  const [reviews, setReviews] = useCollection<ReviewRow>(COLLECTION, seed());
  const setStatus = (id: string, status: ReviewStatus) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };
  return [reviews, { setStatus }];
}

export function listReviews(): ReviewRow[] {
  return readCollection<ReviewRow>(COLLECTION, seed());
}

export function setReviews(next: ReviewRow[]) {
  writeCollection<ReviewRow>(COLLECTION, next);
}
