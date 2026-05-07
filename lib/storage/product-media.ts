/**
 * Product media upload seam.
 *
 * Three operations:
 *   - requestProductMediaUpload: returns a short-lived signed upload URL
 *   - finalizeProductMedia: persists a `product_images` row after the browser PUT
 *   - reorderProductMedia: atomic position update via the `reorder_product_images` RPC
 *
 * All three require service-role credentials (admin path). Without them the
 * functions return a typed `not_configured` error so the UI can show a
 * helpful message rather than failing silently.
 */

import 'server-only';

import {
  isSupabaseAdminConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase } from '@/lib/supabase/server';

export const PRODUCT_MEDIA_BUCKET = 'product-media';
export const PRODUCT_MEDIA_MAX_BYTES = 8 * 1024 * 1024; // 8 MB
export const PRODUCT_MEDIA_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

export interface RequestUploadInput {
  productId: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface SignedUpload {
  url: string;
  /** Object key inside the bucket. Persist on `product_images.storage_path`. */
  path: string;
  /** Final public URL the browser can use once upload completes. */
  publicUrl: string;
  expiresAt: string;
}

export type UploadResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: 'not_configured' | 'validation' | 'unknown'; message: string };

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function requestProductMediaUpload(
  input: RequestUploadInput,
): Promise<UploadResult<SignedUpload>> {
  if (!PRODUCT_MEDIA_ACCEPT.includes(input.contentType)) {
    return {
      ok: false,
      error: 'validation',
      message: `Unsupported file type: ${input.contentType}`,
    };
  }
  if (input.size > PRODUCT_MEDIA_MAX_BYTES) {
    return {
      ok: false,
      error: 'validation',
      message: `File exceeds ${PRODUCT_MEDIA_MAX_BYTES / (1024 * 1024)} MB limit`,
    };
  }

  if (!isSupabaseAdminConfigured()) {
    warnOncePlaceholderMode('storage.requestProductMediaUpload');
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Storage uploads require Supabase service-role credentials. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }

  const path = `${input.productId}/${crypto.randomUUID()}-${slugifyFilename(input.filename)}`;
  const { data, error } = await admin.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return { ok: false, error: 'unknown', message: error?.message ?? 'Signed URL failed' };
  }
  const { data: pub } = admin.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path);
  return {
    ok: true,
    data: {
      url: data.signedUrl,
      path,
      publicUrl: pub.publicUrl,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    },
  };
}

export interface FinalizeMediaInput {
  productId: string;
  storagePath: string;
  /** Public URL captured from `requestProductMediaUpload` so we don't recompute. */
  url?: string;
  alt: string;
  isCover: boolean;
  position: number;
  width?: number;
  height?: number;
}

export async function finalizeProductMedia(
  input: FinalizeMediaInput,
): Promise<UploadResult<{ id: string }>> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Storage uploads require Supabase service-role credentials. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }

  // If this image is being marked as cover, demote any existing cover for the
  // product first to satisfy the partial-unique index `product_images_one_cover`.
  if (input.isCover) {
    const { error: clearErr } = await admin
      .from('product_images')
      .update({ is_cover: false })
      .eq('product_id', input.productId)
      .eq('is_cover', true);
    if (clearErr) {
      return { ok: false, error: 'unknown', message: clearErr.message };
    }
  }

  const url =
    input.url ??
    admin.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(input.storagePath).data.publicUrl;

  const { data, error } = await admin
    .from('product_images')
    .insert({
      product_id: input.productId,
      storage_path: input.storagePath,
      url,
      alt: input.alt || null,
      is_cover: input.isCover,
      position: input.position,
      width: input.width ?? null,
      height: input.height ?? null,
    })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: 'unknown', message: error?.message ?? 'Insert failed' };
  }
  return { ok: true, data: { id: data.id } };
}

export async function reorderProductMedia(
  productId: string,
  orderedImageIds: string[],
): Promise<UploadResult<{ count: number }>> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Storage reordering requires Supabase service-role credentials. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }
  const { data, error } = await admin.rpc('reorder_product_images', {
    p_product_id: productId,
    p_ids: orderedImageIds,
  });
  if (error) {
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true, data: { count: Number(data ?? 0) } };
}
