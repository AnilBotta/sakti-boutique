/**
 * Admin product server action contracts.
 *
 * These are the save/update/archive entry points the `ProductEditor` UI will
 * call. Today they run in placeholder mode: validate the payload, map it to
 * the write shape, and return a typed result — no network, no DB write, no
 * persistence. When Supabase credentials arrive, the bodies below plug
 * straight into `AdminProductsRepo.createAdminProduct` etc.
 *
 * Mark these `'use server'` inside the route-handler file when you wire them
 * to a real Server Action. They're exported as plain async functions here
 * so they stay importable from client components for the placeholder flow.
 */

import type { EditableProduct } from '@/lib/admin/product-editor';
import { validateEditableProduct, type FieldError } from '@/lib/validation/product';
import { editableToWritePayload } from '@/lib/db/mappers';
import * as AdminProductsRepo from '@/lib/repositories/admin-products';

export type ActionResult<T = { id: string }> =
  | { ok: true; data: T; mode: 'live' | 'placeholder' }
  | { ok: false; errors: FieldError[]; message?: string };

export async function saveProductAction(
  product: EditableProduct,
): Promise<ActionResult> {
  const validation = validateEditableProduct(product);
  if (!validation.success) {
    return { ok: false, errors: validation.errors, message: 'Validation failed' };
  }

  const payload = editableToWritePayload(validation.data);

  const res = product.id.startsWith('u_') || product.id === ''
    ? await AdminProductsRepo.createAdminProduct(payload)
    : await AdminProductsRepo.updateAdminProduct(product.id, payload);

  if (res.ok) {
    return { ok: true, data: { id: 'id' in res.data ? res.data.id : product.id }, mode: 'live' };
  }
  if (res.error === 'not_configured') {
    // Placeholder mode: echo the snapshot back so the UI can mark dirty=false.
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
  if (res.ok) return { ok: true, data: { id }, mode: 'live' };
  if (res.error === 'not_configured') {
    return { ok: true, data: { id }, mode: 'placeholder' };
  }
  return { ok: false, errors: [{ path: 'root', message: res.message }] };
}
