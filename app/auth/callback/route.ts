import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Supabase magic-link / PKCE callback.
 *
 * Magic-link emails redirect the browser here with a `?code=...` query param.
 * We exchange that code for a session — `@supabase/ssr` writes the auth
 * cookies onto the response — then redirect to the originally requested
 * destination (`?next=...`, defaulting to `/admin`).
 *
 * Without this route the magic-link click would bounce back to the login
 * page because the session cookie is never set.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';
  const errorDescription = searchParams.get('error_description');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (errorDescription) {
    const loginUrl = new URL('/admin/login', origin);
    loginUrl.searchParams.set('error', errorDescription);
    return NextResponse.redirect(loginUrl);
  }

  if (!code || !url || !anon) {
    const loginUrl = new URL('/admin/login', origin);
    loginUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(loginUrl);
  }

  // Build the redirect response first so the cookie writer below can attach
  // the new auth cookies to it.
  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const loginUrl = new URL('/admin/login', origin);
    loginUrl.searchParams.set('error', error.message);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
