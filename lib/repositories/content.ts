/**
 * Content pages repository — admin reads.
 * Falls back to mock pages when DB is empty.
 */

import { contentPages as placeholderContent } from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getAdminSupabase, getServerSupabase } from '@/lib/supabase/server';

export interface ContentPageRow {
  slug: string;
  title: string;
  status: string;
  updated: string;
}

interface DbContentPageRow {
  slug: string;
  title: string;
  status: string;
  updated_at: string;
}

export async function listContentPages(): Promise<ContentPageRow[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('content.list');
    return placeholderContent.slice();
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return placeholderContent.slice();

  const { data, error } = await db
    .from('content_pages')
    .select('slug, title, status, updated_at')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('[content.list]', error.message);
    return placeholderContent.slice();
  }
  if (!data || data.length === 0) return placeholderContent.slice();

  return (data as unknown as DbContentPageRow[]).map((r) => ({
    slug: r.slug,
    title: r.title,
    status: r.status,
    updated: r.updated_at?.slice(0, 10) ?? '—',
  }));
}

export async function getContentPage(slug: string): Promise<ContentPageRow | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('content.get');
    return placeholderContent.find((c) => c.slug === slug) ?? null;
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return placeholderContent.find((c) => c.slug === slug) ?? null;

  const { data, error } = await db
    .from('content_pages')
    .select('slug, title, status, updated_at')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) {
    return placeholderContent.find((c) => c.slug === slug) ?? null;
  }
  const row = data as unknown as DbContentPageRow;
  return {
    slug: row.slug,
    title: row.title,
    status: row.status,
    updated: row.updated_at?.slice(0, 10) ?? '—',
  };
}
