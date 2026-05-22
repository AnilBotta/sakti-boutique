'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { updateVariantStock } from '@/lib/repositories/admin-inventory';

export interface StockActionResult {
  ok: boolean;
  variantId: string;
  stock?: number;
  /** Indicates the write was skipped because credentials aren't configured. */
  mode?: 'live' | 'placeholder';
  message?: string;
}

export async function updateVariantStockAction(
  variantId: string,
  stock: number,
): Promise<StockActionResult> {
  const res = await updateVariantStock(variantId, stock);
  if (res.ok) {
    revalidatePath('/admin/inventory');
    revalidatePath('/admin');
    revalidateTag('products');
    return {
      ok: true,
      variantId: res.data.id,
      stock: res.data.stock,
      mode: 'live',
    };
  }
  // Mirror the placeholder-safety pattern used by saveProductAction so dev/CI
  // environments without a service-role key get a graceful no-op instead of
  // a noisy error. Production has the key set and never hits this branch.
  if (res.error === 'not_configured') {
    return {
      ok: true,
      variantId,
      stock,
      mode: 'placeholder',
    };
  }
  return { ok: false, variantId, message: res.message };
}
