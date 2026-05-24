'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
const MAX_NAME = 80;

export interface AuthActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<
    Record<'email' | 'password' | 'fullName', string>
  >;
}

const SAFE_REDIRECT_PATH = /^\/(?!\/)[A-Za-z0-9/_\-?=&%.]*$/;
function sanitizeRedirect(raw: string | null | undefined): string {
  if (!raw) return '/account';
  if (raw.startsWith('/admin') || raw.startsWith('/login')) return '/account';
  if (!SAFE_REDIRECT_PATH.test(raw)) return '/account';
  return raw;
}

function unavailable(): AuthActionResult {
  return {
    ok: false,
    message: 'Sign-in is temporarily unavailable. Please try again later.',
  };
}

/**
 * Email + password sign-in for storefront customers.
 *
 * Returns success with the validated redirect path so the client can
 * router.push() once Supabase has set the session cookie. The session
 * cookie is set by getServerSupabase()'s cookie adapter as a side-effect
 * of signInWithPassword().
 */
export async function signInAction(
  formData: FormData,
): Promise<AuthActionResult & { redirectTo?: string; noAccountHint?: boolean }> {
  const email = (formData.get('email')?.toString() || '').trim();
  const password = formData.get('password')?.toString() || '';
  const redirectTo = sanitizeRedirect(
    formData.get('redirect')?.toString() || null,
  );

  const fieldErrors: NonNullable<AuthActionResult['fieldErrors']> = {};
  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }
  if (password.length < 1) {
    fieldErrors.password = 'Please enter your password.';
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  if (!isSupabaseConfigured()) return unavailable();
  const db = getServerSupabase();
  if (!db) return unavailable();

  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) {
    // Don't leak whether the email exists at the API level — both
    // "no account" and "wrong password" return the same shape. The
    // client UI nudges toward Create account regardless, which is
    // useful for genuinely new visitors and harmless for typos.
    return {
      ok: false,
      message:
        "We couldn't sign you in with those details. New to Sakthi? Create an account, or check your password and try again.",
      noAccountHint: true,
    };
  }
  revalidatePath('/account', 'layout');
  return { ok: true, redirectTo };
}

/**
 * Email + password sign-up. The auth.users insert trigger
 * (migration 0011) creates the customers row automatically, so by the
 * time the client redirects to /account the profile is in place.
 *
 * If email confirmation is enabled in the Supabase project, the user
 * will be inserted but not signed in until they click the confirmation
 * link — we surface that as a friendly "check your inbox" message.
 */
export async function signUpAction(
  formData: FormData,
): Promise<AuthActionResult & { redirectTo?: string; needsConfirmation?: boolean }> {
  const email = (formData.get('email')?.toString() || '').trim();
  const password = formData.get('password')?.toString() || '';
  const fullName = (formData.get('fullName')?.toString() || '').trim();
  const redirectTo = sanitizeRedirect(
    formData.get('redirect')?.toString() || null,
  );

  const fieldErrors: NonNullable<AuthActionResult['fieldErrors']> = {};
  if (fullName.length < 2) {
    fieldErrors.fullName = 'Please enter your name.';
  } else if (fullName.length > MAX_NAME) {
    fieldErrors.fullName = `Keep your name under ${MAX_NAME} characters.`;
  }
  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }
  if (password.length < MIN_PASSWORD) {
    fieldErrors.password = `Use at least ${MIN_PASSWORD} characters.`;
  } else if (password.length > MAX_PASSWORD) {
    fieldErrors.password = `Maximum ${MAX_PASSWORD} characters.`;
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  if (!isSupabaseConfigured()) return unavailable();
  const db = getServerSupabase();
  if (!db) return unavailable();

  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: {
      // Stored on auth.users.raw_user_meta_data so the trigger picks it up.
      data: { full_name: fullName },
    },
  });
  if (error) {
    if (/already registered|user_already/i.test(error.message)) {
      return {
        ok: false,
        fieldErrors: {
          email: 'An account with that email already exists. Try signing in.',
        },
      };
    }
    return { ok: false, message: error.message };
  }

  // Supabase returns a user but no session when email confirmation is on.
  if (!data.session) {
    return {
      ok: false,
      message:
        "Check your inbox — we've sent a confirmation link to finish creating your account.",
      needsConfirmation: true,
    };
  }

  revalidatePath('/account', 'layout');
  return { ok: true, redirectTo };
}

/**
 * Sign the current customer out and bounce to the homepage. Called from
 * a form on /account.
 */
export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const db = getServerSupabase();
    if (db) await db.auth.signOut();
  }
  revalidatePath('/account', 'layout');
  redirect('/');
}
