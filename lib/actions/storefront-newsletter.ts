'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SOURCE = 64;
const MAX_EMAIL = 320;

export interface SubscribeResult {
  ok: boolean;
  message?: string;
  /** True when the email was newly added (vs already subscribed). */
  isNew?: boolean;
}

/**
 * Public newsletter subscription. Writes through the anon client; the
 * `public can subscribe to newsletter` RLS policy from migration 0010
 * enforces `status='active'` and `unsubscribed_at IS NULL` on insert.
 *
 * Idempotent on email: re-subscribing returns success without surfacing
 * a confusing "already exists" error. The unique constraint catches the
 * duplicate at the DB level; we map 23505 (Postgres unique_violation)
 * to a friendly "you're already subscribed" success.
 */
export async function subscribeAction(
  formData: FormData,
): Promise<SubscribeResult> {
  const emailRaw = (formData.get('email')?.toString() || '').trim();
  const source = (formData.get('source')?.toString() || 'homepage')
    .trim()
    .slice(0, MAX_SOURCE);

  if (!emailRaw) {
    return { ok: false, message: 'Please enter your email address.' };
  }
  if (emailRaw.length > MAX_EMAIL || !EMAIL_PATTERN.test(emailRaw)) {
    return {
      ok: false,
      message: "That doesn't look like a valid email — please try again.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        'Subscriptions are temporarily unavailable. Please try again later.',
    };
  }

  const db = getServerSupabase();
  if (!db) {
    return {
      ok: false,
      message:
        'Subscriptions are temporarily unavailable. Please try again later.',
    };
  }

  const { error } = await db
    .from('newsletter_subscribers')
    .insert({ email: emailRaw, source, status: 'active' });

  if (error) {
    // 23505 = unique_violation — they're already subscribed. Treat as success
    // so we don't confuse the visitor with a "you exist" error.
    if (error.code === '23505') {
      return {
        ok: true,
        isNew: false,
      };
    }
    console.error('[newsletter.subscribe]', error.message);
    return {
      ok: false,
      message: 'We couldn’t save your subscription right now. Please try again.',
    };
  }

  // The admin Subscribers list + dashboard pendings reflect new sign-ups.
  revalidatePath('/admin/subscribers');
  revalidatePath('/admin');
  return { ok: true, isNew: true };
}
