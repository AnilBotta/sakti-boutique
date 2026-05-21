'use server';

import { revalidatePath } from 'next/cache';
import { advanceOrderStatus, cancelOrder } from '@/lib/repositories/orders';

export interface OrderActionResult {
  ok: boolean;
  message?: string;
}

export async function advanceOrderStatusAction(
  id: string,
): Promise<OrderActionResult> {
  const res = await advanceOrderStatus(id);
  if (res.ok) {
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { ok: true };
  }
  if (res.error === 'not_configured') {
    return { ok: true };
  }
  return { ok: false, message: res.message };
}

export async function cancelOrderAction(id: string): Promise<OrderActionResult> {
  const res = await cancelOrder(id);
  if (res.ok) {
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { ok: true };
  }
  if (res.error === 'not_configured') {
    return { ok: true };
  }
  return { ok: false, message: res.message };
}
