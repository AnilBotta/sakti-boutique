/**
 * Admin auth gating.
 *
 * - When Supabase is configured, reads the live session from the cookie-aware
 *   server client and requires `app_metadata.role === 'admin'`.
 * - When Supabase is NOT configured (placeholder demo / CI), returns a
 *   synthetic admin in development so `/admin` keeps rendering. In production
 *   without credentials, returns `null` and `requireAdmin()` throws.
 */

import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';
import { getServerSupabase } from '@/lib/supabase/server';

export interface AdminSession {
  userId: string;
  email: string;
  role: 'admin';
  /** true when running in placeholder / no-credential mode. */
  placeholder: boolean;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) {
    warnOncePlaceholderMode('auth.getAdminSession');
    if (process.env.NODE_ENV === 'production') return null;
    return {
      userId: 'placeholder-admin',
      email: 'admin@sakti.local',
      role: 'admin',
      placeholder: true,
    };
  }
  const db = getServerSupabase();
  if (!db) return null;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const role = (user.app_metadata as { role?: string } | null)?.role;
  if (role !== 'admin') return null;
  return {
    userId: user.id,
    email: user.email ?? '',
    role: 'admin',
    placeholder: false,
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Admin access required');
  }
  return session;
}
