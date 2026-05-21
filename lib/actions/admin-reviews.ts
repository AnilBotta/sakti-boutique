'use server';

import { revalidatePath } from 'next/cache';
import { setReviewStatus } from '@/lib/repositories/reviews';

export interface ReviewActionResult {
  ok: boolean;
  message?: string;
}

export async function setReviewStatusAction(
  id: string,
  status: 'approved' | 'rejected' | 'hidden',
): Promise<ReviewActionResult> {
  const res = await setReviewStatus(id, status);
  if (res.ok) {
    revalidatePath('/admin/reviews');
    revalidatePath('/admin');
    return { ok: true };
  }
  if (res.error === 'not_configured') {
    return { ok: true };
  }
  return { ok: false, message: res.message };
}
