/**
 * Client-side upload helper for the admin product editor media gallery.
 *
 * Uploads land in the `product-media` Supabase Storage bucket under
 * `products/<productId>/<timestamp>-<random>.<ext>`. The bucket is public-read,
 * write-gated by an `app_metadata.role = 'admin'` RLS policy
 * (see supabase/migrations/0003_storage.sql).
 */

import { getBrowserSupabase } from '@/lib/supabase/client';

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

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return `Unsupported file type — use PNG, JPG, WebP, or AVIF.`;
  }
  if (file.size > MAX_FILE_BYTES) {
    return `File is larger than 8MB.`;
  }
  return null;
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

function makeObjectKey(productId: string, file: File): string {
  const safeProductId = (productId || 'unsaved').replace(/[^a-zA-Z0-9_-]/g, '');
  const random = Math.random().toString(36).slice(2, 8);
  const ext = extensionForFile(file);
  return `products/${safeProductId}/${Date.now()}-${random}.${ext}`;
}

/**
 * Upload a single file to the `product-media` bucket.
 * Returns `{ storagePath, publicUrl }` on success.
 */
export async function uploadProductMedia(
  productId: string,
  file: File,
): Promise<UploadedMediaResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
  const key = makeObjectKey(productId, file);
  const { error: uploadErr } = await supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .upload(key, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type,
    });
  if (uploadErr) {
    throw new Error(uploadErr.message);
  }
  const { data: pub } = supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .getPublicUrl(key);
  return { storagePath: key, publicUrl: pub.publicUrl };
}

/**
 * Best-effort delete of a previously uploaded object. Silently swallows errors
 * because storage cleanup must never block the editor save flow.
 */
export async function deleteProductMedia(storagePath: string): Promise<void> {
  if (!storagePath) return;
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  await supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove([storagePath]);
}
