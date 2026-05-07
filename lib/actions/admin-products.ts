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

import type { EditableProduct } from '@/lib/admin/product-editor';
import { validateEditableProduct, type FieldError } from '@/lib/validation/product';
import { editableToWritePayload } from '@/lib/db/mappers';
import * as AdminProductsRepo from '@/lib/repositories/admin-products';

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
  const validation = validateEditableProduct(product);
  if (!validation.success) {
    return { ok: false, errors: validation.errors, message: 'Validation failed' };
  }

  const payload = editableToWritePayload(validation.data);

  const isNew = product.id.startsWith('u_') || product.id === '';
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
