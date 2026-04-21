'use client';

import {
  readCollection,
  writeCollection,
  useCollection,
  generateId,
} from '@/lib/admin/local-store';
import type { EditableProduct } from '@/lib/admin/product-editor';
import { products as catalogProducts } from '@/lib/catalog/products';
import { toEditableProduct } from '@/lib/admin/product-editor';

const COLLECTION = 'products';

/** Seed the products collection from catalog fixtures on first load. */
function seed(): EditableProduct[] {
  return catalogProducts
    .map((p) => toEditableProduct(p.slug))
    .filter((p): p is EditableProduct => p !== null);
}

function read(): EditableProduct[] {
  return readCollection<EditableProduct>(COLLECTION, seed());
}

function write(next: EditableProduct[]) {
  writeCollection<EditableProduct>(COLLECTION, next);
}

export function listAdminProductsLocal(): EditableProduct[] {
  return read();
}

export function getAdminProductLocal(
  idOrSlug: string,
): EditableProduct | null {
  const all = read();
  return (
    all.find((p) => p.id === idOrSlug || p.seo.slug === idOrSlug) ?? null
  );
}

export function createAdminProductLocal(
  product: EditableProduct,
): EditableProduct {
  const all = read();
  const id = product.id && !all.some((p) => p.id === product.id)
    ? product.id
    : generateId('p');
  const saved: EditableProduct = { ...product, id };
  write([saved, ...all]);
  return saved;
}

export function updateAdminProductLocal(
  id: string,
  product: EditableProduct,
): EditableProduct | null {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const saved: EditableProduct = { ...product, id };
  const next = [...all];
  next[idx] = saved;
  write(next);
  return saved;
}

export function archiveAdminProductLocal(id: string): boolean {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  const next = [...all];
  next[idx] = { ...next[idx], status: 'archived' };
  write(next);
  return true;
}

export function deleteAdminProductLocal(id: string): boolean {
  const all = read();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  write(next);
  return true;
}

export function useAdminProducts(): [
  EditableProduct[],
  {
    create: (p: EditableProduct) => EditableProduct;
    update: (id: string, p: EditableProduct) => EditableProduct | null;
    archive: (id: string) => boolean;
    remove: (id: string) => boolean;
  },
] {
  const [list] = useCollection<EditableProduct>(COLLECTION, seed());
  return [
    list,
    {
      create: createAdminProductLocal,
      update: updateAdminProductLocal,
      archive: archiveAdminProductLocal,
      remove: deleteAdminProductLocal,
    },
  ];
}
