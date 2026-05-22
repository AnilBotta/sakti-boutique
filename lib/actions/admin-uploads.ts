'use server';

/**
 * Server-side upload actions for admin media.
 *
 * Why this exists:
 *   Uploading directly from the browser to Supabase Storage was failing
 *   with "new row violates row-level security policy" on the deployed
 *   admin. The Storage SDK does not reliably attach the user's JWT to
 *   `supabase.storage.upload(...)` when the session is cookie-resident
 *   (a known quirk with `@supabase/ssr` + Storage), so the request
 *   hit the bucket as the anon role and the
 *   `app_metadata.role = 'admin'` RLS check failed.
 *
 * The fix: route uploads through a Server Action gated by `requireAdmin()`,
 * which has access to cookies on the server and can authoritatively
 * verify the caller's role. The action then uses the service-role
 * admin client to write the object — bypassing storage RLS safely
 * because the action itself is the gate.
 */

import { getAdminSupabase } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// `use server` files can only export async functions. Constants and types
// live alongside the client wrapper in `lib/admin/product-media-upload.ts`.
const PRODUCT_MEDIA_BUCKET = 'product-media';
const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
] as const;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

type UploadActionResult =
  | { ok: true; storagePath: string; publicUrl: string }
  | { ok: false; message: string };

type DeleteActionResult =
  | { ok: true }
  | { ok: false; message: string };

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

function makeObjectKey(scope: string, file: File): string {
  const safeScope = (scope || 'unsaved').replace(/[^a-zA-Z0-9_-]/g, '');
  const random = Math.random().toString(36).slice(2, 8);
  const ext = extensionForFile(file);
  return `products/${safeScope}/${Date.now()}-${random}.${ext}`;
}

/**
 * Upload a single image to the `product-media` bucket. Gated by admin role.
 *
 * The form data must include:
 *   - `file`  : the File blob
 *   - `scope` : an arbitrary identifier (product id, slot name, etc.) used
 *               to namespace the storage key. Falls back to `unsaved`.
 */
export async function uploadProductMediaAction(
  formData: FormData,
): Promise<UploadActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Admin access required.' };
  }

  const file = formData.get('file');
  const scope = String(formData.get('scope') ?? 'unsaved');

  if (!(file instanceof File)) {
    return { ok: false, message: 'No file provided.' };
  }
  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return {
      ok: false,
      message: 'Unsupported file type — use PNG, JPG, WebP, or AVIF.',
    };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, message: 'File is larger than 8MB.' };
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return {
      ok: false,
      message:
        'Supabase service-role credentials are not configured on the server.',
    };
  }

  const key = makeObjectKey(scope, file);

  // Convert File → Buffer/ArrayBuffer for the storage SDK. node-fetch's File
  // implementation exposes `arrayBuffer()`.
  const bytes = await file.arrayBuffer();

  const { error: uploadErr } = await admin.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .upload(key, bytes, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type,
    });
  if (uploadErr) {
    return { ok: false, message: uploadErr.message };
  }

  const { data: pub } = admin.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .getPublicUrl(key);

  return { ok: true, storagePath: key, publicUrl: pub.publicUrl };
}

/**
 * Delete a previously uploaded object. Best-effort — silently swallows
 * errors for the caller because storage cleanup must never block the
 * editor save flow. Still gated by admin role.
 */
export async function deleteProductMediaAction(
  storagePath: string,
): Promise<DeleteActionResult> {
  if (!storagePath) return { ok: true };
  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: 'Admin access required.' };
  }
  const admin = getAdminSupabase();
  if (!admin) return { ok: false, message: 'Service role unavailable.' };
  const { error } = await admin.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .remove([storagePath]);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
