/**
 * Client-side wrapper for the admin media upload Server Actions.
 *
 * The actual upload runs server-side (see `lib/actions/admin-uploads.ts`)
 * using the service-role client, gated by `requireAdmin()`. This avoids
 * the unreliable JWT-attachment behaviour of supabase-js's Storage SDK
 * when used directly from a browser session.
 */

import {
  uploadProductMediaAction,
  deleteProductMediaAction,
} from '@/lib/actions/admin-uploads';

export const PRODUCT_MEDIA_BUCKET = 'product-media';

export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
] as const;

export const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

export interface UploadedMediaResult {
  storagePath: string;
  publicUrl: string;
}

export interface UploadFailure {
  fileName: string;
  reason: string;
}

/** Client-side pre-flight validation, mirrored on the server action. */
export function validateImageFile(file: File): string | null {
  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return 'Unsupported file type — use PNG, JPG, WebP, or AVIF.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'File is larger than 8MB.';
  }
  return null;
}

/**
 * Upload a single file via the admin Server Action.
 * `scope` namespaces the storage key (e.g. product id, slot name).
 */
export async function uploadProductMedia(
  scope: string,
  file: File,
): Promise<UploadedMediaResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('scope', scope);
  const res = await uploadProductMediaAction(formData);
  if (!res.ok) {
    throw new Error(res.message);
  }
  return { storagePath: res.storagePath, publicUrl: res.publicUrl };
}

/**
 * Best-effort delete of a previously uploaded object. Silently swallows
 * errors because storage cleanup must never block the editor save flow.
 */
export async function deleteProductMedia(storagePath: string): Promise<void> {
  if (!storagePath) return;
  try {
    await deleteProductMediaAction(storagePath);
  } catch {
    // intentionally swallowed
  }
}
