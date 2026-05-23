'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const MIN_BODY = 10;
const MAX_BODY = 2000;
const MAX_TITLE = 120;
const MAX_NAME = 80;

export interface CreateReviewInput {
  productId: string;
  productSlug: string;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
}

export interface CreateReviewResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<'authorName' | 'rating' | 'title' | 'body', string>>;
}

/**
 * Public-facing review submission. Writes through the anon client so the
 * INSERT RLS policy (`public can submit pending reviews`) enforces:
 *   - status='pending' (the customer cannot self-approve)
 *   - moderated_at is null
 *   - customer_id is null or matches auth.uid()
 *
 * Validation is server-side; the form re-renders with field errors on
 * failure. On success we revalidate the PDP so the admin still has to
 * approve before the new review surfaces to the next visitor.
 */
export async function createReviewAction(
  input: CreateReviewInput,
): Promise<CreateReviewResult> {
  const fieldErrors: NonNullable<CreateReviewResult['fieldErrors']> = {};

  const authorName = input.authorName.trim();
  if (authorName.length < 2) fieldErrors.authorName = 'Please enter your name.';
  else if (authorName.length > MAX_NAME)
    fieldErrors.authorName = `Keep it under ${MAX_NAME} characters.`;

  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    fieldErrors.rating = 'Pick a rating from 1 to 5 stars.';
  }

  const title = input.title?.trim() || null;
  if (title && title.length > MAX_TITLE) {
    fieldErrors.title = `Keep the title under ${MAX_TITLE} characters.`;
  }

  const body = input.body.trim();
  if (body.length < MIN_BODY) {
    fieldErrors.body = `Tell us a bit more — at least ${MIN_BODY} characters.`;
  } else if (body.length > MAX_BODY) {
    fieldErrors.body = `Keep your review under ${MAX_BODY} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'Reviews are temporarily unavailable. Please try again later.',
    };
  }

  const db = getServerSupabase();
  if (!db) {
    return {
      ok: false,
      message: 'Reviews are temporarily unavailable. Please try again later.',
    };
  }

  const { error } = await db.from('reviews').insert({
    product_id: input.productId,
    author_name: authorName,
    rating,
    title,
    body,
    status: 'pending',
  });

  if (error) {
    console.error('[storefront-reviews.create]', error.message);
    return {
      ok: false,
      message: 'We couldn’t save your review just now. Please try again.',
    };
  }

  revalidatePath(`/p/${input.productSlug}`);
  revalidatePath('/admin/reviews');
  revalidatePath('/admin');
  return { ok: true };
}
