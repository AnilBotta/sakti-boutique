/**
 * Site imagery repository.
 *
 * Slot-keyed editorial images for the storefront. Each slot is a stable
 * text key (e.g. `audience_women`) that storefront components read by name.
 * Admin writes through `lib/actions/admin-site-imagery.ts`.
 */

import 'server-only';

import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';

/** Stable slot keys consumed by storefront components. Extend as new slots are added. */
export const SITE_IMAGE_SLOTS = [
  'audience_women',
  'audience_men',
  'audience_kids',
] as const;
export type SiteImageSlot = (typeof SITE_IMAGE_SLOTS)[number];

export interface SiteImage {
  slot: SiteImageSlot;
  url: string | null;
  storagePath: string | null;
  alt: string | null;
  updatedAt: string | null;
}

/** Build an empty record for a slot. Returned when no row exists yet. */
function emptySlot(slot: SiteImageSlot): SiteImage {
  return { slot, url: null, storagePath: null, alt: null, updatedAt: null };
}

/**
 * Look up a single slot. Returns `null`-fields when no upload exists,
 * never throws.
 */
export async function getSiteImage(slot: SiteImageSlot): Promise<SiteImage> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('site-imagery.get');
    return emptySlot(slot);
  }
  const db = getServerSupabase();
  if (!db) return emptySlot(slot);

  const { data, error } = await db
    .from('site_imagery')
    .select('slot, url, storage_path, alt, updated_at')
    .eq('slot', slot)
    .maybeSingle();
  if (error) {
    console.error('[site-imagery.get]', slot, error.message);
    return emptySlot(slot);
  }
  if (!data) return emptySlot(slot);
  const row = data as {
    slot: SiteImageSlot;
    url: string | null;
    storage_path: string | null;
    alt: string | null;
    updated_at: string | null;
  };
  return {
    slot: row.slot,
    url: row.url,
    storagePath: row.storage_path,
    alt: row.alt,
    updatedAt: row.updated_at,
  };
}

/**
 * Batch read for the storefront — fetch every requested slot in one round-trip.
 * Slots that don't have a row yet are returned with `null` fields.
 */
export async function listSiteImages(
  slots: readonly SiteImageSlot[],
): Promise<Record<SiteImageSlot, SiteImage>> {
  const empty = Object.fromEntries(
    slots.map((s) => [s, emptySlot(s)]),
  ) as Record<SiteImageSlot, SiteImage>;

  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('site-imagery.list');
    return empty;
  }
  const db = getServerSupabase();
  if (!db) return empty;

  const { data, error } = await db
    .from('site_imagery')
    .select('slot, url, storage_path, alt, updated_at')
    .in('slot', slots as unknown as string[]);
  if (error) {
    console.error('[site-imagery.list]', error.message);
    return empty;
  }
  const out = { ...empty };
  for (const row of (data ?? []) as Array<{
    slot: SiteImageSlot;
    url: string | null;
    storage_path: string | null;
    alt: string | null;
    updated_at: string | null;
  }>) {
    if (!slots.includes(row.slot)) continue;
    out[row.slot] = {
      slot: row.slot,
      url: row.url,
      storagePath: row.storage_path,
      alt: row.alt,
      updatedAt: row.updated_at,
    };
  }
  return out;
}

// ---------------------------------------------------------------------------
// Writes (used only by admin server actions)
// ---------------------------------------------------------------------------

export type SiteImageWriteResult =
  | { ok: true; data: SiteImage }
  | { ok: false; error: 'not_configured' | 'unknown'; message: string };

export async function upsertSiteImage(
  slot: SiteImageSlot,
  patch: { url: string | null; storagePath: string | null; alt: string | null },
): Promise<SiteImageWriteResult> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message:
        'Supabase service-role credentials are not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }
  const { data, error } = await admin
    .from('site_imagery')
    .upsert(
      {
        slot,
        url: patch.url,
        storage_path: patch.storagePath,
        alt: patch.alt,
      },
      { onConflict: 'slot' },
    )
    .select('slot, url, storage_path, alt, updated_at')
    .single();
  if (error || !data) {
    return {
      ok: false,
      error: 'unknown',
      message: error?.message ?? 'Upsert failed',
    };
  }
  const row = data as {
    slot: SiteImageSlot;
    url: string | null;
    storage_path: string | null;
    alt: string | null;
    updated_at: string | null;
  };
  return {
    ok: true,
    data: {
      slot: row.slot,
      url: row.url,
      storagePath: row.storage_path,
      alt: row.alt,
      updatedAt: row.updated_at,
    },
  };
}
