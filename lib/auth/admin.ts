/**
 * Admin auth gating seam.
 *
 * Step 10A: no live login, no middleware enforcement. This module exposes
 * the shape that route handlers, server actions, and future middleware will
 * consume, so Step 10B can drop a real Supabase Auth session in without
 * touching call sites.
 *
 * Placeholder behavior:
 *   - `getAdminSession()` returns a synthetic admin session in development
 *     so the local demo browses the admin area freely.
 *   - In production, absence of credentials returns `null` and
 *     `requireAdmin()` throws so deploy-time misconfiguration fails loud.
 */

import {
  isSupabaseConfigured,
  warnOncePlaceholderMode,
} from '@/lib/supabase/env';

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
  // LIVE (Step 10B):
  //   const db = getServerSupabase()!;
  //   const { data: { user } } = await db.auth.getUser();
  //   if (!user) return null;
  //   const role = (user.app_metadata as { role?: string })?.role;
  //   if (role !== 'admin') return null;
  //   return { userId: user.id, email: user.email!, role: 'admin', placeholder: false };
  return null;
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Admin access required');
  }
  return session;
}

/**
 * Hook into Next middleware in Step 10B:
 *
 *   // middleware.ts
 *   import { NextResponse } from 'next/server';
 *   import { createMiddlewareClient } from '@supabase/ssr';
 *
 *   export async function middleware(req) {
 *     if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();
 *     const supabase = createMiddlewareClient({ req });
 *     const { data: { user } } = await supabase.auth.getUser();
 *     const role = (user?.app_metadata as any)?.role;
 *     if (!user || role !== 'admin') {
 *       return NextResponse.redirect(new URL('/login', req.url));
 *     }
 *     return NextResponse.next();
 *   }
 *   export const config = { matcher: ['/admin/:path*'] };
 */
