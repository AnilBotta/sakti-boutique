/**
 * Reviews repository — admin reads + status mutations.
 * Returns whatever is in the DB. Empty DB → empty list; the admin UI
 * renders an empty state. Customer submissions land via the storefront
 * server action (lib/actions/storefront-reviews.ts) as `status='pending'`.
 */

import 'server-only';

import type { ReviewRow, ReviewStatus } from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';
import type { DbReviewStatus } from '@/lib/db/types';

interface DbReviewRow {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  body: string;
  title: string | null;
  status: DbReviewStatus;
  submitted_at: string;
  product?: { name: string } | null;
}

function mapStatus(s: DbReviewStatus): ReviewStatus {
  // DB has 'pending' | 'approved' | 'rejected' | 'hidden';
  // admin UI collapses 'rejected' and 'hidden' under 'hidden'.
  return s === 'pending' ? 'pending' : s === 'approved' ? 'approved' : 'hidden';
}

function toReviewRow(row: DbReviewRow): ReviewRow {
  return {
    id: row.id,
    product: row.product?.name ?? row.product_id,
    author: row.author_name,
    rating: row.rating,
    excerpt:
      (row.title ? `${row.title} — ` : '') +
      (row.body.length > 120 ? `${row.body.slice(0, 117)}…` : row.body),
    status: mapStatus(row.status),
    submittedAt: row.submitted_at.slice(0, 16).replace('T', ' '),
  };
}

export async function listReviews(limit = 100): Promise<ReviewRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('reviews.list');
    return [];
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from('reviews')
    .select('id, product_id, author_name, rating, title, body, status, submitted_at, product:products(name)')
    .order('submitted_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[reviews.list]', error.message);
    return [];
  }
  return (data as unknown as DbReviewRow[]).map(toReviewRow);
}

export async function listPendingReviews(limit = 100): Promise<ReviewRow[]> {
  const all = await listReviews(limit);
  return all.filter((r) => r.status === 'pending');
}

/**
 * Public-facing review shape rendered on the PDP. Excludes moderation status
 * and other admin-only fields.
 */
export interface PublicReview {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  body: string;
  submittedAt: string;
  /** Customer-uploaded review photos. Empty array when none. */
  photos: string[];
}

export interface ProductReviewSummary {
  count: number;
  /** Mean rating, rounded to one decimal. 0 when count === 0. */
  average: number;
  /** Most recent approved reviews for the product, newest first. */
  reviews: PublicReview[];
}

/**
 * Featured review used by the homepage "Loved across the country" block.
 * Includes the product name so the card can credit "on the {product}".
 */
export interface FeaturedReview {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  body: string;
  submittedAt: string;
  productName: string;
}

/**
 * Top approved reviews across every product, prioritized by rating
 * (5★ first) then recency. Used for the homepage testimonials section.
 * Returns [] when no reviews are approved yet — caller hides the block.
 */
export async function listFeaturedApprovedReviews(
  limit = 3,
): Promise<FeaturedReview[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('reviews.featured');
    return [];
  }
  const db = getServerSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from('reviews')
    .select('id, author_name, rating, title, body, submitted_at, product:products(name)')
    .eq('status', 'approved')
    .order('rating', { ascending: false })
    .order('submitted_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[reviews.featured]', error.message);
    return [];
  }
  return ((data ?? []) as unknown as Array<{
    id: string;
    author_name: string;
    rating: number;
    title: string | null;
    body: string;
    submitted_at: string;
    product: { name: string } | null;
  }>).map((r) => ({
    id: r.id,
    author: r.author_name,
    rating: r.rating,
    title: r.title,
    body: r.body,
    submittedAt: r.submitted_at,
    productName: r.product?.name ?? '',
  }));
}

/**
 * Approved reviews for a single product, plus a summary the PDP uses to
 * render the average-rating header. Always returns a valid summary — empty
 * count/avg/list when the product has no reviews yet.
 */
export async function getProductReviews(
  productId: string,
  limit = 20,
): Promise<ProductReviewSummary> {
  const empty: ProductReviewSummary = { count: 0, average: 0, reviews: [] };
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('reviews.public');
    return empty;
  }
  const db = getServerSupabase();
  if (!db) return empty;

  const { data, error } = await db
    .from('reviews')
    .select('id, author_name, rating, title, body, photos, submitted_at')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[reviews.public]', error.message);
    return empty;
  }
  const rows = (data ?? []) as Array<{
    id: string;
    author_name: string;
    rating: number;
    title: string | null;
    body: string;
    photos: string[] | null;
    submitted_at: string;
  }>;
  if (rows.length === 0) return empty;

  const sum = rows.reduce((n, r) => n + r.rating, 0);
  return {
    count: rows.length,
    average: Math.round((sum / rows.length) * 10) / 10,
    reviews: rows.map((r) => ({
      id: r.id,
      author: r.author_name,
      rating: r.rating,
      title: r.title,
      body: r.body,
      photos: r.photos ?? [],
      submittedAt: r.submitted_at,
    })),
  };
}

export type ReviewMutationResult =
  | { ok: true }
  | { ok: false; error: 'not_configured' | 'unknown'; message: string };

export async function setReviewStatus(
  id: string,
  status: 'approved' | 'rejected' | 'hidden',
): Promise<ReviewMutationResult> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Supabase service-role credentials are not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }
  const { error } = await admin
    .from('reviews')
    .update({ status, moderated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('[reviews.setStatus]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true };
}
