'use server';

/**
 * Server-side upload actions for admin media.
 *
 * Media lives in Cloudinary (migrated off Supabase Storage). Uploads run
 * through a Server Action gated by `requireAdmin()` so the API secret never
 * reaches the browser and the caller's role is authoritatively verified
 * server-side from the session cookie.
 *
 * The return shape is deliberately unchanged from the Supabase era:
 *   { storagePath, publicUrl }
 * `storagePath` now carries the Cloudinary `public_id` instead of a bucket
 * object key, so `product_images.storage_path` / `site_imagery.storage_path`
 * keep working without a schema change.
 */

import { requireAdmin } from '@/lib/auth/admin';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  publicIdFromUrl,
} from '@/lib/cloudinary/server';

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

type DeleteActionResult = { ok: true } | { ok: false; message: string };

/**
 * Map an arbitrary caller-supplied scope onto a Cloudinary folder.
 *
 * Product editor passes a product id; the storefront imagery editor passes
 * `site-<slot>`. Keep those in separate folder trees so the Cloudinary media
 * library stays browsable.
 */
function folderForScope(scope: string): string {
  const safe = (scope || 'unsaved').replace(/[^a-zA-Z0-9_-]/g, '');
  if (safe.startsWith('site-')) {
    return `site/${safe.slice('site-'.length) || 'misc'}`;
  }
  return `products/${safe}`;
}

/**
 * Upload a single image to Cloudinary. Gated by admin role.
 *
 * The form data must include:
 *   - `file`  : the File blob
 *   - `scope` : an identifier (product id, `site-<slot>`, …) used to choose
 *               the destination folder. Falls back to `unsaved`.
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

  const bytes = await file.arrayBuffer();
  const res = await uploadToCloudinary(bytes, {
    folder: folderForScope(scope),
    filename: file.name,
  });
  if (!res.ok) {
    return { ok: false, message: res.message };
  }

  return {
    ok: true,
    storagePath: res.data.publicId,
    publicUrl: res.data.url,
  };
}

/**
 * Delete a previously uploaded asset. Best-effort — callers treat failure as
 * non-fatal because cleanup must never block the editor save flow.
 *
 * Accepts either a Cloudinary `public_id` or a full delivery URL, so legacy
 * rows that stored a URL in `storage_path` still resolve.
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

  const publicId = storagePath.startsWith('http')
    ? publicIdFromUrl(storagePath)
    : storagePath;
  if (!publicId) {
    // Nothing we can act on (e.g. a legacy Supabase URL). Treat as success so
    // the caller's remove-from-gallery flow still completes.
    return { ok: true };
  }

  const res = await deleteFromCloudinary(publicId);
  if (!res.ok) return { ok: false, message: res.message };
  return { ok: true };
}
