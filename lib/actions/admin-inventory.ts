'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { updateVariantStock } from '@/lib/repositories/admin-inventory';

export interface StockActionResult {
  ok: boolean;
  variantId: string;
  stock?: number;
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
    return { ok: true, variantId: res.data.id, stock: res.data.stock };
  }
  return { ok: false, variantId, message: res.message };
}
