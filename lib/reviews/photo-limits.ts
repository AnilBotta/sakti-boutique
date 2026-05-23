/**
 * Shared photo upload limits for customer review submissions.
 *
 * Lives in its own client-safe module so both the storefront review form
 * (client component) and the server action (`'use server'` file, which
 * may only export async functions) can read the same constants.
 */

export const REVIEW_MAX_PHOTOS = 5;
export const REVIEW_MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
export const REVIEW_ACCEPTED_PHOTO_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
] as const;
export type ReviewAcceptedPhotoType =
  (typeof REVIEW_ACCEPTED_PHOTO_TYPES)[number];
