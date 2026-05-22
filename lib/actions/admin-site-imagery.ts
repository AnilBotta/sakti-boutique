'use server';

/**
 * Site imagery Server Actions.
 *
 * Admin operators upload an image client-side via the existing
 * `product-media` Supabase Storage bucket helper, then submit the
 * resolved URL + storage path here so the row gets persisted and the
 * storefront revalidates.
 */

import { revalidatePath, revalidateTag } from 'next/cache';

import {
  upsertSiteImage,
  type SiteImageSlot,
  SITE_IMAGE_SLOTS,
} from '@/lib/repositories/site-imagery';

export type SiteImageActionResult =
  | { ok: true; mode: 'live' | 'placeholder'; slot: SiteImageSlot }
  | { ok: false; message: string };

function isValidSlot(value: string): value is SiteImageSlot {
  return (SITE_IMAGE_SLOTS as readonly string[]).includes(value);
}

export async function saveSiteImageAction(input: {
  slot: string;
  url: string | null;
  storagePath: string | null;
  alt: string | null;
}): Promise<SiteImageActionResult> {
  if (!isValidSlot(input.slot)) {
    return { ok: false, message: `Unknown slot: ${input.slot}` };
  }
  const res = await upsertSiteImage(input.slot, {
    url: input.url,
    storagePath: input.storagePath,
    alt: input.alt,
  });
  if (res.ok) {
    // Storefront homepage + admin page consume the data; revalidate both.
    revalidatePath('/');
    revalidatePath('/admin/storefront-imagery');
    revalidateTag('site_imagery');
    return { ok: true, mode: 'live', slot: input.slot };
  }
  if (res.error === 'not_configured') {
    // Mirror the placeholder-mode safety used by product/inventory actions.
    return { ok: true, mode: 'placeholder', slot: input.slot };
  }
  return { ok: false, message: res.message };
}
