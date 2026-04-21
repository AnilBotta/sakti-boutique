/**
 * Supabase client factories — **no-credential safe**.
 *
 * This file intentionally does NOT import `@supabase/supabase-js`. The package
 * isn't installed yet and importing it would break builds. Instead, each
 * factory returns `null` when credentials are missing, and in the live path
 * (Step 10B) a dynamic import wires the real client.
 *
 * Replacement plan for Step 10B:
 *   1. `npm install @supabase/supabase-js @supabase/ssr`
 *   2. Swap the `createX` bodies below to call the real `createClient` /
 *      `createBrowserClient` / `createServerClient`.
 *   3. Keep the `null` fallback branches so placeholder mode still works in
 *      environments without secrets (local demos, preview deploys, CI).
 *
 * Repositories in `lib/repositories/*` already branch on `isSupabaseConfigured()`
 * so flipping the switch requires zero component changes.
 */

import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  readSupabaseEnv,
} from './env';

/**
 * Minimal structural type for the Supabase client we actually use in
 * repositories. Widen as needed in Step 10B; kept tiny to avoid pretending
 * we have a real client when we don't.
 */
export interface SupabaseLike {
  readonly _stub: true;
}

/** Browser client for use in client components. `null` when not configured. */
export function getBrowserSupabase(): SupabaseLike | null {
  if (!isSupabaseConfigured()) return null;
  // Step 10B:
  //   const { createBrowserClient } = await import('@supabase/ssr');
  //   const env = readSupabaseEnv();
  //   return createBrowserClient(env.url!, env.anonKey!);
  return null;
}

/** Server client for RSC, Route Handlers, and Server Actions. */
export function getServerSupabase(): SupabaseLike | null {
  if (!isSupabaseConfigured()) return null;
  // Step 10B:
  //   const { createServerClient } = await import('@supabase/ssr');
  //   const { cookies } = await import('next/headers');
  //   const env = readSupabaseEnv();
  //   return createServerClient(env.url!, env.anonKey!, { cookies: cookies() });
  return null;
}

/**
 * Service-role client — NEVER import this from a client component. Intended
 * for trusted server paths only (admin mutations, webhook handlers, Edge
 * Functions running on the server).
 */
export function getAdminSupabase(): SupabaseLike | null {
  if (!isSupabaseAdminConfigured()) return null;
  // Step 10B:
  //   const { createClient } = await import('@supabase/supabase-js');
  //   const env = readSupabaseEnv();
  //   return createClient(env.url!, env.serviceRoleKey!, {
  //     auth: { autoRefreshToken: false, persistSession: false },
  //   });
  void readSupabaseEnv;
  return null;
}
