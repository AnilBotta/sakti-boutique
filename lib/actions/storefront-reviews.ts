'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
} from '@/lib/cloudinary/server';
import {
  REVIEW_ACCEPTED_PHOTO_TYPES,
  REVIEW_MAX_PHOTOS,
  REVIEW_MAX_PHOTO_BYTES,
} from '@/lib/reviews/photo-limits';

const MIN_BODY = 10;
const MAX_BODY = 2000;
const MAX_TITLE = 120;
const MAX_NAME = 80;

export interface CreateReviewResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<
    Record<'authorName' | 'rating' | 'title' | 'body' | 'photos', string>
  >;
}

/**
 * Public review submission. Accepts FormData so the storefront form can
 * attach photo files alongside the text fields.
 *
 * Insert is via the anon client and gated by the
 * `public can submit pending reviews` RLS policy, which enforces:
 *   - status='pending' (customer cannot self-approve)
 *   - moderated_at is null
 *   - customer_id is null or matches auth.uid()
 *
 * Photos are uploaded to Cloudinary with server-only credentials. The
 * server action is the gate: limits, mime-types, and counts are enforced
 * here before anything leaves the process.
 *
 * On success we revalidate the PDP — the new review starts pending so
 * it won't show to other shoppers until the operator approves it in
 * /admin/reviews.
 */
export async function createReviewAction(
  formData: FormData,
): Promise<CreateReviewResult> {
  const fieldErrors: NonNullable<CreateReviewResult['fieldErrors']> = {};

  const productId = String(formData.get('productId') ?? '');
  const productSlug = String(formData.get('productSlug') ?? '');
  if (!productId || !productSlug) {
    return { ok: false, message: 'Missing product reference.' };
  }

  const authorName = String(formData.get('authorName') ?? '').trim();
  if (authorName.length < 2) fieldErrors.authorName = 'Please enter your name.';
  else if (authorName.length > MAX_NAME)
    fieldErrors.authorName = `Keep it under ${MAX_NAME} characters.`;

  const rating = Number(formData.get('rating'));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    fieldErrors.rating = 'Pick a rating from 1 to 5 stars.';
  }

  const titleRaw = String(formData.get('title') ?? '').trim();
  const title = titleRaw || null;
  if (title && title.length > MAX_TITLE) {
    fieldErrors.title = `Keep the title under ${MAX_TITLE} characters.`;
  }

  const body = String(formData.get('body') ?? '').trim();
  if (body.length < MIN_BODY) {
    fieldErrors.body = `Tell us a bit more — at least ${MIN_BODY} characters.`;
  } else if (body.length > MAX_BODY) {
    fieldErrors.body = `Keep your review under ${MAX_BODY} characters.`;
  }

  // Photos — optional. Only validate what's actually attached.
  const photoFiles = formData.getAll('photos').filter(
    (v): v is File => v instanceof File && v.size > 0,
  );
  if (photoFiles.length > REVIEW_MAX_PHOTOS) {
    fieldErrors.photos = `Up to ${REVIEW_MAX_PHOTOS} photos per review.`;
  } else {
    for (const f of photoFiles) {
      if (
        !REVIEW_ACCEPTED_PHOTO_TYPES.includes(
          f.type as (typeof REVIEW_ACCEPTED_PHOTO_TYPES)[number],
        )
      ) {
        fieldErrors.photos = 'Photos must be PNG, JPG, WebP, or AVIF.';
        break;
      }
      if (f.size > REVIEW_MAX_PHOTO_BYTES) {
        fieldErrors.photos = `Each photo must be under ${Math.round(
          REVIEW_MAX_PHOTO_BYTES / (1024 * 1024),
        )}MB.`;
        break;
      }
    }
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

  // Upload photos first (if any) so the review row carries the final URLs
  // atomically. Cloudinary credentials are server-only; this action is the
  // gate — limits, mime-types, and counts are all enforced above.
  const photoUrls: string[] = [];
  const uploadedPublicIds: string[] = [];
  if (photoFiles.length > 0) {
    if (!isCloudinaryConfigured()) {
      return {
        ok: false,
        message:
          'Photo uploads are temporarily unavailable. Try again without photos.',
      };
    }
    const folder = `reviews/${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    for (const f of photoFiles) {
      const bytes = await f.arrayBuffer();
      const res = await uploadToCloudinary(bytes, {
        folder,
        filename: f.name,
      });
      if (!res.ok) {
        console.error('[storefront-reviews.upload]', res.message);
        // Best-effort cleanup so a partial failure doesn't leave orphans.
        await Promise.all(
          uploadedPublicIds.map((id) => deleteFromCloudinary(id)),
        ).catch(() => {});
        return {
          ok: false,
          message:
            'We couldn’t upload your photos just now. Please try again.',
        };
      }
      uploadedPublicIds.push(res.data.publicId);
      photoUrls.push(res.data.url);
    }
  }

  const db = getServerSupabase();
  if (!db) {
    return {
      ok: false,
      message: 'Reviews are temporarily unavailable. Please try again later.',
    };
  }

  const { error } = await db.from('reviews').insert({
    product_id: productId,
    author_name: authorName,
    rating,
    title,
    body,
    photos: photoUrls,
    status: 'pending',
  });

  if (error) {
    console.error('[storefront-reviews.create]', error.message);
    return {
      ok: false,
      message: 'We couldn’t save your review just now. Please try again.',
    };
  }

  revalidatePath(`/p/${productSlug}`);
  revalidatePath('/admin/reviews');
  revalidatePath('/admin');
  revalidatePath('/');
  return { ok: true };
}
