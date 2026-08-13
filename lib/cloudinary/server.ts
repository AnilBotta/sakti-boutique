/**
 * Cloudinary server-side seam.
 *
 * All media (product images, storefront editorial imagery, customer review
 * photos) is stored in Cloudinary. Uploads run server-side only — the API
 * secret must never reach the browser.
 *
 * Env vars (add to .env.local and to Vercel project settings):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * `public_id` is what we persist in the existing `storage_path` columns —
 * it's the stable handle used for deletes and transformations. The `url`
 * columns keep holding a fully-qualified delivery URL so read paths stay
 * unchanged.
 */

import 'server-only';

import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryEnv {
  cloudName: string | null;
  apiKey: string | null;
  apiSecret: string | null;
}

export function readCloudinaryEnv(): CloudinaryEnv {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? null,
    apiKey: process.env.CLOUDINARY_API_KEY ?? null,
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? null,
  };
}

/** True only when all three credentials are present. */
export function isCloudinaryConfigured(): boolean {
  const env = readCloudinaryEnv();
  return Boolean(env.cloudName && env.apiKey && env.apiSecret);
}

let _configured = false;

/**
 * Lazily configure the SDK singleton. Returns null when credentials are
 * missing so callers can surface a typed error instead of throwing.
 */
function getClient(): typeof cloudinary | null {
  if (!isCloudinaryConfigured()) return null;
  if (!_configured) {
    const env = readCloudinaryEnv();
    cloudinary.config({
      cloud_name: env.cloudName!,
      api_key: env.apiKey!,
      api_secret: env.apiSecret!,
      secure: true,
    });
    _configured = true;
  }
  return cloudinary;
}

/** Root folder so Cloudinary stays tidy if the account is ever shared. */
export const CLOUDINARY_ROOT = 'sakti';

export interface UploadedAsset {
  /** Cloudinary `public_id` — persist on the `storage_path` column. */
  publicId: string;
  /** Delivery URL with automatic format + quality. Persist on `url`. */
  url: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
}

export type CloudinaryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: 'not_configured' | 'unknown'; message: string };

/**
 * Upload raw bytes to Cloudinary.
 *
 * `folder` is appended under CLOUDINARY_ROOT (e.g. `products/<id>`), so the
 * final public_id looks like `sakti/products/<id>/<random>`.
 */
export async function uploadToCloudinary(
  bytes: ArrayBuffer | Buffer,
  opts: { folder: string; filename?: string },
): Promise<CloudinaryResult<UploadedAsset>> {
  const client = getClient();
  if (!client) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    };
  }

  const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const folder = `${CLOUDINARY_ROOT}/${opts.folder}`.replace(/\/+/g, '/');

  try {
    const result = await new Promise<Record<string, unknown>>(
      (resolve, reject) => {
        const stream = client.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            // Let Cloudinary pick a collision-free id; we persist whatever
            // it returns rather than guessing.
            unique_filename: true,
            overwrite: false,
            // Strip EXIF (incl. GPS) from customer-supplied photos.
            invalidate: true,
          },
          (err, res) => {
            if (err || !res) {
              reject(err ?? new Error('Upload returned no result'));
              return;
            }
            resolve(res as unknown as Record<string, unknown>);
          },
        );
        stream.end(buffer);
      },
    );

    const publicId = String(result.public_id ?? '');
    if (!publicId) {
      return { ok: false, error: 'unknown', message: 'No public_id returned.' };
    }

    return {
      ok: true,
      data: {
        publicId,
        url: deliveryUrl(publicId),
        width: typeof result.width === 'number' ? result.width : null,
        height: typeof result.height === 'number' ? result.height : null,
        bytes: typeof result.bytes === 'number' ? result.bytes : null,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: 'unknown',
      message: e instanceof Error ? e.message : 'Cloudinary upload failed',
    };
  }
}

/**
 * Build a delivery URL with automatic format and quality negotiation.
 * `f_auto` serves AVIF/WebP where supported; `q_auto` picks a perceptual
 * quality target. This is why uploaded images no longer need to go through
 * the Next.js image optimizer.
 */
export function deliveryUrl(publicId: string): string {
  const env = readCloudinaryEnv();
  if (!env.cloudName) return '';
  return `https://res.cloudinary.com/${env.cloudName}/image/upload/f_auto,q_auto/${publicId}`;
}

/**
 * Best-effort delete. Callers treat failure as non-fatal — orphaned assets
 * are cheaper than a blocked save.
 */
export async function deleteFromCloudinary(
  publicId: string,
): Promise<CloudinaryResult<{ publicId: string }>> {
  if (!publicId) return { ok: true, data: { publicId } };
  const client = getClient();
  if (!client) {
    return {
      ok: false,
      error: 'not_configured',
      message: 'Cloudinary is not configured.',
    };
  }
  try {
    await client.uploader.destroy(publicId, { invalidate: true });
    return { ok: true, data: { publicId } };
  } catch (e) {
    return {
      ok: false,
      error: 'unknown',
      message: e instanceof Error ? e.message : 'Cloudinary delete failed',
    };
  }
}

/**
 * Recover a Cloudinary public_id from a delivery URL. Used by cleanup paths
 * that only have the URL (e.g. review photo rollback).
 *
 * Handles the transformation segment: everything between `/upload/` and the
 * public_id is dropped, as is the file extension.
 */
export function publicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const afterUpload = url.split('/image/upload/')[1];
  if (!afterUpload) return null;
  // Drop a leading transformation segment (contains `_`, e.g. `f_auto,q_auto`)
  // and any version segment (`v1234567890`).
  const parts = afterUpload.split('/');
  while (
    parts.length > 1 &&
    (/^v\d+$/.test(parts[0]) || /(^|,)[a-z]+_/.test(parts[0]))
  ) {
    parts.shift();
  }
  const joined = parts.join('/');
  return joined.replace(/\.[a-z0-9]+$/i, '') || null;
}
