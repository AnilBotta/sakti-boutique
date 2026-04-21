/**
 * Reviews repository shell.
 */

import { reviewQueue, type ReviewRow } from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';

export async function listPendingReviews(): Promise<ReviewRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('reviews.listPending');
    return reviewQueue.filter((r) => r.status === 'pending');
  }
  // LIVE (Step 10B): select * from reviews where status = 'pending'
  return reviewQueue.filter((r) => r.status === 'pending');
}

export async function listAllReviews(): Promise<ReviewRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('reviews.listAll');
    return reviewQueue;
  }
  return reviewQueue;
}
