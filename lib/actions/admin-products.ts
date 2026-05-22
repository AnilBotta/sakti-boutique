'use server';

/**
 * Admin product Server Actions.
 *
 * Validates the editor payload, runs through the admin repository, and
 * revalidates the affected paths so the storefront and admin list reflect
 * fresh data without a full reload.
 *
 * In placeholder mode (Supabase service-role unset), these still return
 * `{ ok: true, mode: 'placeholder' }` so the UI can mark the form clean.
 */

import { revalidatePath, revalidateTag } from 'next/cache';

import {
  generateSku,
  slugify,
  type EditableProduct,
} from '@/lib/admin/product-editor';
import { validateEditableProduct, type FieldError } from '@/lib/validation/product';
import { editableToWritePayload } from '@/lib/db/mappers';
import * as AdminProductsRepo from '@/lib/repositories/admin-products';

/**
 * Apply forgiving defaults so common omissions don't hard-fail validation:
 * - If `seo.slug` is empty, derive from `name`.
 * - For each variant with an empty `sku`, generate `{NAME}-{SIZE}-{COLOR}-{N}`.
 *
 * This runs BEFORE validation. Operators can still set explicit values
 * for either field; we only fill blanks.
 */
function withAutoFields(p: EditableProduct): EditableProduct {
  const slug = p.seo.slug?.trim() ? p.seo.slug : slugify(p.name);
  const variants = p.variants.map((v, i) => {
    if (v.sku?.trim()) return v;
    return { ...v, sku: generateSku(p.name, v.size, v.color, i) };
  });
  return { ...p, seo: { ...p.seo, slug }, variants };
}

export type ActionResult<T = { id: string }> =
  | { ok: true; data: T; mode: 'live' | 'placeholder' }
  | { ok: false; errors: FieldError[]; message?: string };

function revalidateAfterWrite(productId?: string) {
  // Admin list + edit pages
  revalidatePath('/admin/products');
  if (productId) revalidatePath(`/admin/products/${productId}`);
  // Storefront — homepage and category landings depend on `listProducts`
  revalidatePath('/');
  revalidatePath('/women');
  revalidatePath('/men');
  revalidatePath('/kids');
  revalidateTag('products');
}

export async function saveProductAction(
  product: EditableProduct,
): Promise<ActionResult> {
  const filled = withAutoFields(product);
  const validation = validateEditableProduct(filled);
  if (!validation.success) {
    return { ok: false, errors: validation.errors, message: 'Validation failed' };
  }

  const payload = editableToWritePayload(validation.data);

  // The id is either a real Postgres UUID (existing product) or a transient
  // client-side uid from `makeUid()` like `p_mpg8r..._7` (unsaved). Treat
  // anything that doesn't match the UUID shape as a new insert.
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    product.id,
  );
  const isNew = !isUuid;
  const res = isNew
    ? await AdminProductsRepo.createAdminProduct(payload)
    : await AdminProductsRepo.updateAdminProduct(product.id, payload);

  if (res.ok) {
    revalidateAfterWrite(res.data.id);
    return { ok: true, data: { id: res.data.id }, mode: 'live' };
  }
  if (res.error === 'not_configured') {
    return {
      ok: true,
      data: { id: product.id || 'placeholder' },
      mode: 'placeholder',
    };
  }
  return {
    ok: false,
    errors: [{ path: 'root', message: res.message }],
  };
}

export async function archiveProductAction(id: string): Promise<ActionResult> {
  const res = await AdminProductsRepo.archiveAdminProduct(id);
  if (res.ok) {
    revalidateAfterWrite(id);
    return { ok: true, data: { id }, mode: 'live' };
  }
  if (res.error === 'not_configured') {
    return { ok: true, data: { id }, mode: 'placeholder' };
  }
  return { ok: false, errors: [{ path: 'root', message: res.message }] };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const res = await AdminProductsRepo.deleteAdminProduct(id);
  if (res.ok) {
    revalidateAfterWrite();
    return { ok: true, data: { id }, mode: 'live' };
  }
  if (res.error === 'not_configured') {
    return { ok: true, data: { id }, mode: 'placeholder' };
  }
  return { ok: false, errors: [{ path: 'root', message: res.message }] };
}
