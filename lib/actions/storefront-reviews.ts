'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase, getAdminSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import {
  REVIEW_ACCEPTED_PHOTO_TYPES,
  REVIEW_MAX_PHOTOS,
  REVIEW_MAX_PHOTO_BYTES,
} from '@/lib/reviews/photo-limits';

const MIN_BODY = 10;
const MAX_BODY = 2000;
const MAX_TITLE = 120;
const MAX_NAME = 80;

const PRODUCT_MEDIA_BUCKET = 'product-media';

export interface CreateReviewResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<
    Record<'authorName' | 'rating' | 'title' | 'body' | 'photos', string>
  >;
}

function extensionForFile(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  return map[file.type] ?? 'bin';
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
 * Photos are uploaded with the service-role admin client because the
 * `product-media` bucket only permits admin writes (the same constraint
 * the storefront imagery uploads run under). The server action is the
 * gate: limits, mime-types, and counts are enforced here.
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
  // atomically. We use the service-role admin client to bypass storage RLS
  // — the action is the gate, not the bucket policy.
  const photoUrls: string[] = [];
  if (photoFiles.length > 0) {
    const admin = getAdminSupabase();
    if (!admin) {
      return {
        ok: false,
        message:
          'Photo uploads are temporarily unavailable. Try again without photos.',
      };
    }
    const folder = `reviews/${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    for (let i = 0; i < photoFiles.length; i++) {
      const f = photoFiles[i];
      const key = `${folder}/${i + 1}.${extensionForFile(f)}`;
      const bytes = await f.arrayBuffer();
      const { error: uploadErr } = await admin.storage
        .from(PRODUCT_MEDIA_BUCKET)
        .upload(key, bytes, {
          cacheControl: '31536000',
          upsert: false,
          contentType: f.type,
        });
      if (uploadErr) {
        console.error('[storefront-reviews.upload]', uploadErr.message);
        // Best-effort cleanup so we don't leave orphans on a partial failure.
        if (photoUrls.length > 0) {
          await admin.storage
            .from(PRODUCT_MEDIA_BUCKET)
            .remove(
              photoUrls.map(
                (u) => u.split(`${PRODUCT_MEDIA_BUCKET}/`)[1] ?? '',
              ),
            )
            .catch(() => {});
        }
        return {
          ok: false,
          message:
            'We couldn’t upload your photos just now. Please try again.',
        };
      }
      const { data: pub } = admin.storage
        .from(PRODUCT_MEDIA_BUCKET)
        .getPublicUrl(key);
      photoUrls.push(pub.publicUrl);
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
