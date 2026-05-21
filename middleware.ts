import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Admin route guard.
 *
 * Scoped to `/admin/*` only (see `config.matcher`). The storefront and every
 * other public route bypass this middleware entirely, so the homepage doesn't
 * pay for a Supabase `getUser()` round-trip on every request.
 *
 * Behaviour:
 * - If Supabase env vars aren't configured, fall through (placeholder mode).
 * - `/admin/login` is always reachable — otherwise we'd create an infinite
 *   redirect loop.
 * - Everything else under `/admin/*` requires `app_metadata.role === 'admin'`.
 *   Non-admins get bounced to `/admin/login?redirect=...`.
 * - In development without a real session we let traffic through so the
 *   placeholder admin session in `lib/auth/admin.ts` keeps the local dev
 *   loop usable.
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // /admin/login must stay open or we loop.
  if (path === '/admin/login' || path.startsWith('/admin/login/')) {
    return NextResponse.next();
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.app_metadata as { role?: string } | null)?.role;
  const isAdmin = !!user && role === 'admin';
  const allowDev = process.env.NODE_ENV !== 'production' && !user;
  if (!isAdmin && !allowDev) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Only run on /admin/* — the public storefront must not pay the cost of a
  // Supabase session check on every request.
  matcher: ['/admin/:path*'],
};
