/**
 * Supabase BROWSER client factory.
 *
 * Server-side factories (`getServerSupabase`, `getAdminSupabase`) live in
 * `./server` so they don't get pulled into client bundles.
 *
 * Returns `null` when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * are missing, so placeholder mode keeps working in zero-credential demos.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { isSupabaseConfigured, readSupabaseEnv } from './env';

let _browser: SupabaseClient | null = null;

/** Browser client. Memoized per module so we have one instance per tab. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (_browser) return _browser;
  const env = readSupabaseEnv();
  _browser = createBrowserClient(env.url!, env.anonKey!);
  return _browser;
}
