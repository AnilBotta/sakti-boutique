/**
 * Content pages repository.
 *
 * The `content_pages` table stores editorial pages the operator authors in
 * /admin/content. Each page has:
 *   - slug         — URL-safe id; doubles as the public path under /journal/
 *   - title        — visible title shown above the body
 *   - body         — structured JSON: ContentBlock[]; rendered by the
 *                    storefront /journal/[slug] route
 *   - status       — 'draft' or 'published'; only published pages are public
 *   - meta_title   — optional <title> override for SEO
 *   - meta_description — optional <meta description> override
 *
 * Admin reads see all rows (draft + published). The public reader is
 * scoped to `status='published'` only.
 *
 * NOTE: The hand-coded storefront pages (/about, /faq, /contact) are NOT
 * sourced from this table. They live in `app/(storefront)/{about,faq,contact}/`
 * and are managed in code. This table powers additional editorial pages
 * (Spring Lookbook, Journal entries, brand stories) that the operator
 * wants to publish without a code deploy.
 */

import 'server-only';

import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';

export type ContentPageStatus = 'draft' | 'published';

/** A typed block that renders inside a content page body. */
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'image'; src: string; alt: string };

export interface ContentPageRow {
  slug: string;
  title: string;
  status: string;
  updated: string;
}

export interface ContentPageFull {
  id: string;
  slug: string;
  title: string;
  status: ContentPageStatus;
  body: ContentBlock[];
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
}

interface DbContentListRow {
  slug: string;
  title: string;
  status: string;
  updated_at: string;
}

interface DbContentFullRow extends DbContentListRow {
  id: string;
  body: unknown;
  meta_title: string | null;
  meta_description: string | null;
}

function normalizeBody(raw: unknown): ContentBlock[] {
  if (!raw || typeof raw !== 'object') return [];
  // Persisted shape: { blocks: ContentBlock[] }
  const blocks = (raw as { blocks?: unknown }).blocks;
  if (!Array.isArray(blocks)) return [];
  return blocks.filter((b): b is ContentBlock => {
    if (!b || typeof b !== 'object') return false;
    const t = (b as { type?: unknown }).type;
    return t === 'paragraph' || t === 'heading' || t === 'image';
  });
}

export async function listContentPages(): Promise<ContentPageRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('content.list');
    return [];
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from('content_pages')
    .select('slug, title, status, updated_at')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('[content.list]', error.message);
    return [];
  }
  return ((data ?? []) as unknown as DbContentListRow[]).map((r) => ({
    slug: r.slug,
    title: r.title,
    status: r.status,
    updated: r.updated_at?.slice(0, 10) ?? '—',
  }));
}

/**
 * Full row for the admin editor. Includes body + meta fields.
 * Returns null if not found.
 */
export async function getContentPageForEdit(
  slug: string,
): Promise<ContentPageFull | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('content.getForEdit');
    return null;
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return null;

  const { data, error } = await db
    .from('content_pages')
    .select(
      'id, slug, title, status, body, meta_title, meta_description, updated_at',
    )
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as DbContentFullRow;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: (row.status as ContentPageStatus) ?? 'draft',
    body: normalizeBody(row.body),
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    updatedAt: row.updated_at,
  };
}

/**
 * Public reader — returns the page only if it's published. Used by the
 * storefront /journal/[slug] route.
 */
export async function getPublishedContentPage(
  slug: string,
): Promise<ContentPageFull | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('content.public');
    return null;
  }
  const db = getServerSupabase();
  if (!db) return null;

  const { data, error } = await db
    .from('content_pages')
    .select(
      'id, slug, title, status, body, meta_title, meta_description, updated_at',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as DbContentFullRow;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: 'published',
    body: normalizeBody(row.body),
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Writes (used only by admin server actions)
// ---------------------------------------------------------------------------

export type ContentPageMutationResult =
  | { ok: true; slug: string }
  | {
      ok: false;
      error: 'not_configured' | 'conflict' | 'unknown';
      message: string;
    };

export interface SaveContentPageInput {
  /** When set, update by id; otherwise upsert by slug. */
  id?: string;
  slug: string;
  title: string;
  status: ContentPageStatus;
  body: ContentBlock[];
  metaTitle: string | null;
  metaDescription: string | null;
}

export async function saveContentPage(
  input: SaveContentPageInput,
): Promise<ContentPageMutationResult> {
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

  const payload = {
    slug: input.slug,
    title: input.title,
    status: input.status,
    body: { blocks: input.body },
    meta_title: input.metaTitle,
    meta_description: input.metaDescription,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await admin
      .from('content_pages')
      .update(payload)
      .eq('id', input.id);
    if (error) {
      console.error('[content.save:update]', error.message);
      return { ok: false, error: 'unknown', message: error.message };
    }
    return { ok: true, slug: input.slug };
  }

  // New row — upsert on slug so a duplicate slug returns a clean conflict
  // rather than crashing the form.
  const { error } = await admin
    .from('content_pages')
    .insert(payload);
  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        error: 'conflict',
        message: `A page with slug "${input.slug}" already exists.`,
      };
    }
    console.error('[content.save:insert]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true, slug: input.slug };
}

export async function deleteContentPage(
  id: string,
): Promise<ContentPageMutationResult> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message: 'Service role unavailable.',
    };
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return { ok: false, error: 'not_configured', message: 'Admin client unavailable.' };
  }
  const { error } = await admin.from('content_pages').delete().eq('id', id);
  if (error) {
    console.error('[content.delete]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true, slug: '' };
}
