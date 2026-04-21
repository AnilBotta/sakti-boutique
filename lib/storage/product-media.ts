/**
 * Product media upload seam.
 *
 * The admin `MediaGalleryField` currently appends a local placeholder tile
 * when an operator clicks the dropzone. In Step 10B, that handler will call
 * `requestProductMediaUpload()` to get a short-lived signed upload URL,
 * PUT the file directly from the browser to Supabase Storage, then call
 * `finalizeProductMedia()` to persist the row in `product_images`.
 *
 * Nothing in this file performs a real upload. It documents the contract
 * and returns typed `not_configured` results so the UI can show a clear
 * message if someone wires the button before credentials exist.
 */

import {
  isSupabaseAdminConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';

/** Bucket name that Step 10B should create in Supabase Storage. */
export const PRODUCT_MEDIA_BUCKET = 'product-media';

/** Max accepted file size in bytes. Enforced client-side AND by policies. */
export const PRODUCT_MEDIA_MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/** Accepted MIME types. */
export const PRODUCT_MEDIA_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

export interface RequestUploadInput {
  productId: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface SignedUpload {
  /** Pre-signed URL the browser PUTs the file to. */
  url: string;
  /** Object key inside the bucket. Persisted on `product_images.storage_path`. */
  path: string;
  /** Absolute expiry timestamp for the signed URL. */
  expiresAt: string;
}

export type UploadResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: 'not_configured' | 'validation' | 'unknown'; message: string };

export async function requestProductMediaUpload(
  input: RequestUploadInput,
): Promise<UploadResult<SignedUpload>> {
  // Client-side sanity checks
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
        'Storage uploads require Supabase service-role credentials. Running in placeholder mode.',
    };
  }

  // LIVE (Step 10B):
  //   const admin = getAdminSupabase()!;
  //   const path = `${input.productId}/${crypto.randomUUID()}-${input.filename}`;
  //   const { data, error } = await admin.storage
  //     .from(PRODUCT_MEDIA_BUCKET)
  //     .createSignedUploadUrl(path);
  //   if (error) return { ok: false, error: 'unknown', message: error.message };
  //   return {
  //     ok: true,
  //     data: {
  //       url: data.signedUrl,
  //       path,
  //       expiresAt: new Date(Date.now() + 60_000).toISOString(),
  //     },
  //   };

  return { ok: false, error: 'unknown', message: 'Not yet implemented' };
}

export interface FinalizeMediaInput {
  productId: string;
  storagePath: string;
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
        'Storage uploads require Supabase service-role credentials. Running in placeholder mode.',
    };
  }
  // LIVE (Step 10B): insert a `product_images` row referencing `storagePath`,
  // unset previous cover if `isCover` is true (respects the unique partial
  // index from the migration), and return the new id.
  void input;
  return { ok: false, error: 'unknown', message: 'Not yet implemented' };
}

/**
 * Reorder contract used by a future drag-and-drop handler in
 * `MediaGalleryField`. Takes the ordered list of image ids and persists
 * `position` for each in a single RPC.
 */
export async function reorderProductMedia(
  productId: string,
  orderedImageIds: string[],
): Promise<UploadResult<{ count: number }>> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Storage reordering requires Supabase service-role credentials. Running in placeholder mode.',
    };
  }
  void productId;
  void orderedImageIds;
  return { ok: false, error: 'unknown', message: 'Not yet implemented' };
}
