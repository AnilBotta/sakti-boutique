/**
 * Customer-side auth helpers.
 *
 * Mirrors lib/auth/admin.ts but for storefront visitors:
 *   - getCurrentCustomer() returns the signed-in customer (or null for guests).
 *   - requireCustomer() redirects guests to /login with the original path
 *     preserved so they bounce back after signing in.
 *
 * The customers row is auto-created by the auth.users insert trigger
 * (migration 0011), so a fresh signup has a profile to read from
 * immediately — no race window.
 */

import 'server-only';

import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getServerSupabase } from '@/lib/supabase/server';

export interface CustomerSession {
  authUserId: string;
  customerId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  orderCount: number;
  lifetimeValue: number;
  createdAt: string;
}

/**
 * Returns the current signed-in customer, or null for guests.
 * Never throws — caller decides whether absence is an error.
 */
export async function getCurrentCustomer(): Promise<CustomerSession | null> {
  if (!isSupabaseConfigured()) return null;
  const db = getServerSupabase();
  if (!db) return null;

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  // Skip admins — they shouldn't accidentally surface in customer-only flows.
  const role = (user.app_metadata as { role?: string } | null)?.role;
  if (role === 'admin') return null;

  const { data: profile, error } = await db
    .from('customers')
    .select(
      'id, email, full_name, phone, order_count, lifetime_value, created_at',
    )
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[auth.customer.profile]', error.message);
    return null;
  }

  if (!profile) {
    // The trigger should have created the row at signup. If it didn't (e.g.
    // user pre-existed before the trigger landed), fall back to the auth
    // user's email so the UI doesn't break.
    return {
      authUserId: user.id,
      customerId: '',
      email: user.email ?? '',
      fullName:
        (user.user_metadata as { full_name?: string; name?: string } | null)
          ?.full_name ??
        (user.user_metadata as { name?: string } | null)?.name ??
        null,
      phone: null,
      orderCount: 0,
      lifetimeValue: 0,
      createdAt: user.created_at,
    };
  }

  const row = profile as {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    order_count: number | null;
    lifetime_value: number | string | null;
    created_at: string;
  };
  return {
    authUserId: user.id,
    customerId: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    orderCount: row.order_count ?? 0,
    lifetimeValue: Number(row.lifetime_value ?? 0),
    createdAt: row.created_at,
  };
}

/**
 * Guard for customer-only routes. Redirects to /login when the caller
 * isn't signed in, preserving the destination so we bounce back after
 * sign-in completes.
 */
export async function requireCustomer(
  redirectFrom: string,
): Promise<CustomerSession> {
  const session = await getCurrentCustomer();
  if (!session) {
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectFrom)}`;
    redirect(loginUrl);
  }
  return session;
}
