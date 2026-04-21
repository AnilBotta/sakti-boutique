/**
 * Content pages repository shell.
 */

import { contentPages } from '@/lib/admin/mock-data';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';

export async function listContentPages() {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('content.list');
    return contentPages;
  }
  // LIVE (Step 10B): select from content_pages
  return contentPages;
}

export async function getContentPage(slug: string) {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('content.get');
    return contentPages.find((c) => c.slug === slug) ?? null;
  }
  return contentPages.find((c) => c.slug === slug) ?? null;
}
