'use client';

import {
  readCollection,
  writeCollection,
  useCollection,
} from '@/lib/admin/local-store';
import { categoryImage } from '@/lib/catalog/category-imagery';

const COLLECTION = 'categoryOverrides';

export interface CategoryOverride {
  /** Composite key: `<audience>/<category>` */
  key: string;
  label: string;
  image: string;
}

function seed(): CategoryOverride[] {
  return [];
}

export function useCategoryOverrides(): [
  CategoryOverride[],
  (next: CategoryOverride[] | ((p: CategoryOverride[]) => CategoryOverride[])) => void,
] {
  return useCollection<CategoryOverride>(COLLECTION, seed());
}

export function getCategoryOverride(
  audience: string,
  category: string,
): CategoryOverride | undefined {
  const all = readCollection<CategoryOverride>(COLLECTION, seed());
  return all.find((o) => o.key === `${audience}/${category}`);
}

export function upsertCategoryOverride(
  audience: string,
  category: string,
  patch: Partial<Omit<CategoryOverride, 'key'>>,
) {
  const all = readCollection<CategoryOverride>(COLLECTION, seed());
  const key = `${audience}/${category}`;
  const idx = all.findIndex((o) => o.key === key);
  const current = idx === -1
    ? { key, label: '', image: categoryImage(audience, category) }
    : all[idx];
  const next: CategoryOverride = { ...current, ...patch };
  const list = idx === -1 ? [...all, next] : all.map((o, i) => (i === idx ? next : o));
  writeCollection<CategoryOverride>(COLLECTION, list);
}

export function clearCategoryOverride(audience: string, category: string) {
  const all = readCollection<CategoryOverride>(COLLECTION, seed());
  const key = `${audience}/${category}`;
  writeCollection<CategoryOverride>(
    COLLECTION,
    all.filter((o) => o.key !== key),
  );
}
