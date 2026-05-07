import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Admin route guard.
 *
 * - If Supabase env vars aren't configured, fall through (placeholder mode).
 * - Otherwise require an authenticated user with `app_metadata.role === 'admin'`.
 * - Non-admin requests to `/admin/*` are redirected to `/login?redirect=...`.
 *
 * Side effect: refreshes the auth cookie if expired so subsequent reads see
 * a valid session. This is the canonical `@supabase/ssr` middleware pattern.
 */
export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next();

  const response = NextResponse.next({ request: req });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session cookies if expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The admin login page itself must always be reachable — otherwise we'd
  // create an infinite redirect loop. Everything else under /admin/* requires
  // an admin role.
  const path = req.nextUrl.pathname;
  const isAdminRoute = path.startsWith('/admin');
  const isLoginRoute = path === '/admin/login' || path.startsWith('/admin/login/');

  if (isAdminRoute && !isLoginRoute) {
    const role = (user?.app_metadata as { role?: string } | null)?.role;
    const isAdmin = !!user && role === 'admin';
    // In development we let unauthenticated traffic through so the
    // placeholder admin session in `lib/auth/admin.ts` keeps the local
    // dev loop usable before a real admin user is created. Production
    // always requires a real admin role.
    const allowDev = process.env.NODE_ENV !== 'production' && !user;
    if (!isAdmin && !allowDev) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  // Match everything except _next assets, public files, and the favicon.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|mp4|gif)).*)'],
};
