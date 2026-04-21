/**
 * Env guard for Supabase integration.
 *
 * The app MUST continue to run without any Supabase credentials. This module
 * reads the optional env vars, provides `isSupabaseConfigured()` so
 * repositories can decide whether to hit live data or fall back to the
 * placeholder catalog, and never throws on missing values.
 *
 * When Step 10B wires real credentials, drop the following into `.env.local`:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 *   SUPABASE_SERVICE_ROLE_KEY=...          # server-only, never public
 */

export interface SupabaseEnv {
  url: string | null;
  anonKey: string | null;
  serviceRoleKey: string | null;
}

export function readSupabaseEnv(): SupabaseEnv {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
  };
}

/** True when both the public URL and anon key are set. */
export function isSupabaseConfigured(): boolean {
  const env = readSupabaseEnv();
  return Boolean(env.url && env.anonKey);
}

/** True only when the service-role key is also present (server-side flows). */
export function isSupabaseAdminConfigured(): boolean {
  const env = readSupabaseEnv();
  return Boolean(env.url && env.serviceRoleKey);
}

/**
 * Small helper used by repositories to log a one-time hint in dev when they
 * fall back to placeholder data. Safe to call repeatedly.
 */
let _warned = false;
export function warnOncePlaceholderMode(label: string): void {
  if (_warned || process.env.NODE_ENV === 'production') return;
  _warned = true;
  // eslint-disable-next-line no-console
  console.info(
    `[sakti] ${label}: Supabase not configured — using placeholder data. ` +
      'Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY to go live.',
  );
}
