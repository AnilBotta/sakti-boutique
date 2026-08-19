'use server';

/**
 * Admin Integrations server actions.
 *
 * Owner-entered Stripe + USPS credentials and USPS shipping settings. Every
 * action is gated by `requireAdmin()` (defense in depth over the middleware
 * route guard) because it reads/writes secrets. Secrets are written encrypted
 * through the service-role repo and are never returned to the caller — only a
 * masked view is exposed elsewhere.
 */

import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';

import { requireAdmin } from '@/lib/auth/admin';
import {
  upsertIntegrationSecrets,
  updatePublicConfig,
  setMode,
  setEnabled,
  getSecretsForMode,
  type IntegrationProvider,
  type IntegrationMode,
} from '@/lib/repositories/integration-settings';

export type IntegrationActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

async function gate(): Promise<{ email: string } | null> {
  try {
    const session = await requireAdmin();
    return { email: session.email };
  } catch {
    return null;
  }
}

const DENIED: IntegrationActionResult = {
  ok: false,
  message: 'Admin access required.',
};

function revalidate() {
  revalidatePath('/admin/integrations');
}

// ---------------------------------------------------------------------------
// Save keys
// ---------------------------------------------------------------------------

export async function saveStripeKeysAction(input: {
  mode: IntegrationMode;
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
}): Promise<IntegrationActionResult> {
  const admin = await gate();
  if (!admin) return DENIED;
  const res = await upsertIntegrationSecrets(
    'stripe',
    input.mode,
    {
      publishableKey: input.publishableKey,
      secretKey: input.secretKey,
      webhookSecret: input.webhookSecret,
    },
    admin.email,
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidate();
  return { ok: true, message: `Stripe ${input.mode} keys saved.` };
}

export async function saveUspsKeysAction(input: {
  mode: IntegrationMode;
  consumerKey?: string;
  consumerSecret?: string;
}): Promise<IntegrationActionResult> {
  const admin = await gate();
  if (!admin) return DENIED;
  const res = await upsertIntegrationSecrets(
    'usps',
    input.mode,
    {
      consumerKey: input.consumerKey,
      consumerSecret: input.consumerSecret,
    },
    admin.email,
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidate();
  return { ok: true, message: `USPS ${input.mode} keys saved.` };
}

export async function saveUspsShippingAction(input: {
  originZip: string;
  enabledServices: string[];
  priceType: 'RETAIL' | 'COMMERCIAL';
  accountNumber?: string;
  defaultBox: { weightOz: number; length: number; width: number; height: number };
  handling: { type: 'flat' | 'percent'; amount: number };
}): Promise<IntegrationActionResult> {
  const admin = await gate();
  if (!admin) return DENIED;
  const res = await updatePublicConfig(
    'usps',
    {
      originZip: input.originZip.trim(),
      enabledServices: input.enabledServices,
      priceType: input.priceType,
      accountNumber: (input.accountNumber ?? '').trim(),
      defaultBox: {
        weightOz: Number(input.defaultBox.weightOz) || 0,
        length: Number(input.defaultBox.length) || 0,
        width: Number(input.defaultBox.width) || 0,
        height: Number(input.defaultBox.height) || 0,
      },
      handling: {
        type: input.handling.type,
        amount: Number(input.handling.amount) || 0,
      },
    },
    admin.email,
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidate();
  return { ok: true, message: 'USPS shipping settings saved.' };
}

// ---------------------------------------------------------------------------
// Mode / enabled toggles
// ---------------------------------------------------------------------------

export async function setIntegrationModeAction(
  provider: IntegrationProvider,
  mode: IntegrationMode,
): Promise<IntegrationActionResult> {
  const admin = await gate();
  if (!admin) return DENIED;
  const res = await setMode(provider, mode, admin.email);
  if (!res.ok) return { ok: false, message: res.message };
  revalidate();
  return { ok: true, message: `${provider} switched to ${mode} mode.` };
}

export async function setIntegrationEnabledAction(
  provider: IntegrationProvider,
  enabled: boolean,
): Promise<IntegrationActionResult> {
  const admin = await gate();
  if (!admin) return DENIED;
  const res = await setEnabled(provider, enabled, admin.email);
  if (!res.ok) return { ok: false, message: res.message };
  revalidate();
  return { ok: true, message: `${provider} ${enabled ? 'enabled' : 'disabled'}.` };
}

// ---------------------------------------------------------------------------
// Test connection
// ---------------------------------------------------------------------------

export async function testStripeConnectionAction(
  mode: IntegrationMode,
): Promise<IntegrationActionResult> {
  const admin = await gate();
  if (!admin) return DENIED;
  const secrets = await getSecretsForMode('stripe', mode);
  const secretKey = secrets?.secretKey;
  if (!secretKey) {
    return { ok: false, message: `No Stripe ${mode} secret key saved yet.` };
  }
  try {
    const stripe = new Stripe(secretKey);
    const balance = await stripe.balance.retrieve();
    const live = balance.livemode ? 'live' : 'test';
    if ((mode === 'live') !== balance.livemode) {
      return {
        ok: false,
        message: `Key works, but it is a ${live}-mode key stored under "${mode}". Check the key.`,
      };
    }
    return { ok: true, message: `Connected — valid ${live}-mode Stripe key.` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe connection failed.';
    return { ok: false, message: msg };
  }
}

// USPS hosts: production vs test/CAT. Test keys only authenticate against the
// test host, so the connection check must be mode-aware.
function uspsOauthUrl(mode: IntegrationMode): string {
  const host = mode === 'live' ? 'https://apis.usps.com' : 'https://apis-tem.usps.com';
  return `${host}/oauth2/v3/token`;
}

export async function testUspsConnectionAction(
  mode: IntegrationMode,
): Promise<IntegrationActionResult> {
  const admin = await gate();
  if (!admin) return DENIED;
  const secrets = await getSecretsForMode('usps', mode);
  const consumerKey = secrets?.consumerKey;
  const consumerSecret = secrets?.consumerSecret;
  if (!consumerKey || !consumerSecret) {
    return { ok: false, message: `No USPS ${mode} keys saved yet.` };
  }
  try {
    const res = await fetch(uspsOauthUrl(mode), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: consumerKey,
        client_secret: consumerSecret,
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        message: `USPS rejected the keys (HTTP ${res.status}).${text ? ` ${text.slice(0, 160)}` : ''}`,
      };
    }
    const json = (await res.json()) as { access_token?: string };
    if (!json.access_token) {
      return { ok: false, message: 'USPS did not return an access token.' };
    }
    return { ok: true, message: 'Connected — USPS keys are valid.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'USPS connection failed.';
    return { ok: false, message: msg };
  }
}
