/**
 * Server-only Supabase factories.
 *
 * These pull in `next/headers` and the service-role key — importing this
 * file from a client component will throw at build time thanks to
 * `server-only`.
 */

import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { isSupabaseConfigured, isSupabaseAdminConfigured, readSupabaseEnv } from './env';

let _admin: SupabaseClient | null = null;

/**
 * Server client for RSC, route handlers, and Server Actions. NOT memoized —
 * a fresh client is created per request so the cookies adapter binds to the
 * current request scope.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const env = readSupabaseEnv();
  const cookieStore = cookies();
  return createServerClient(env.url!, env.anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // RSC contexts can't set cookies — ignore. Middleware handles refresh.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS — use ONLY in trusted server paths
 * (admin server actions, webhooks, edge functions).
 */
export function getAdminSupabase(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) return null;
  if (_admin) return _admin;
  const env = readSupabaseEnv();
  _admin = createClient(env.url!, env.serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}
