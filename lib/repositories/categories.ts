/**
 * Categories repository — read-only.
 * Returns the locked category tree from the DB. Falls back to the hardcoded
 * taxonomy when DB is unconfigured.
 */

import { audiences, taxonomy } from '@/lib/catalog/taxonomy';
import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getServerSupabase, getAdminSupabase } from '@/lib/supabase/server';
import type { DbAudience } from '@/lib/db/types';

export interface CategoryNode {
  id: string;
  slug: string;
  label: string;
  audience: DbAudience;
  bannerUrl: string | null;
  subcategories: Array<{
    id: string;
    slug: string;
    label: string;
    bannerUrl: string | null;
  }>;
}

export interface CategoryTree {
  audience: DbAudience;
  label: string;
  categories: CategoryNode[];
}

function fallbackTree(): CategoryTree[] {
  return audiences.map((a) => ({
    audience: a,
    label: taxonomy[a].label,
    categories: taxonomy[a].categories.map((c) => ({
      id: `${a}-${c.slug}`,
      slug: c.slug,
      label: c.label,
      audience: a,
      bannerUrl: null,
      subcategories: c.subcategories.map((s) => ({
        id: `${a}-${c.slug}-${s.slug}`,
        slug: s.slug,
        label: s.label,
        bannerUrl: null,
      })),
    })),
  }));
}

interface DbCategoryRow {
  id: string;
  parent_id: string | null;
  audience: DbAudience | null;
  slug: string;
  label: string;
  position: number;
  banner_url: string | null;
}

export async function listCategoryTree(): Promise<CategoryTree[]> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('categories.list');
    return fallbackTree();
  }
  const db = getAdminSupabase() ?? getServerSupabase();
  if (!db) return fallbackTree();

  const { data, error } = await db
    .from('categories')
    .select('id, parent_id, audience, slug, label, position, banner_url')
    .order('position', { ascending: true });
  if (error) {
    console.error('[categories.list]', error.message);
    return fallbackTree();
  }
  if (!data || data.length === 0) return fallbackTree();

  const rows = data as unknown as DbCategoryRow[];
  // Audience roots: parent_id is null AND there's a child whose parent is this row.
  // Simpler heuristic: roots are rows where slug === audience.
  const audienceRoots = rows.filter(
    (r) => r.parent_id === null && r.audience && r.slug === r.audience,
  );
  const tree: CategoryTree[] = audienceRoots
    .sort((a, b) => a.position - b.position)
    .map((root) => {
      const topLevel = rows
        .filter((r) => r.parent_id === root.id)
        .sort((a, b) => a.position - b.position)
        .map((cat) => ({
          id: cat.id,
          slug: cat.slug,
          label: cat.label,
          audience: cat.audience as DbAudience,
          bannerUrl: cat.banner_url,
          subcategories: rows
            .filter((r) => r.parent_id === cat.id)
            .sort((a, b) => a.position - b.position)
            .map((sub) => ({
              id: sub.id,
              slug: sub.slug,
              label: sub.label,
              bannerUrl: sub.banner_url,
            })),
        }));
      return {
        audience: root.audience as DbAudience,
        label: root.label,
        categories: topLevel,
      };
    });
  return tree;
}
