/**
 * Integration settings repository.
 *
 * Single data-access point for the owner-entered Stripe + USPS credentials and
 * USPS shipping settings. All access goes through the service-role client
 * (`getAdminSupabase`) because the `integration_settings` table has no
 * public/authenticated read policy — secrets must never be reachable from a
 * non-privileged path.
 *
 * True credentials live encrypted (AES-256-GCM) in `secrets_encrypted`; only
 * masked last-4 hints (`hints`) and non-secret operational values
 * (`public_config`) are ever returned to the admin UI. Decrypted secrets are
 * returned ONLY by `getSecretsForMode` / `getActiveSecrets`, which are consumed
 * by server-only paths (test-connection now, checkout/rating later).
 */

import 'server-only';

import { getAdminSupabase } from '@/lib/supabase/server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/env';
import {
  encryptJson,
  decryptJson,
  isEncryptionConfigured,
  maskSecret,
} from '@/lib/crypto/secrets';

export type IntegrationProvider = 'stripe' | 'usps';
export type IntegrationMode = 'test' | 'live';

export interface StripeModeSecrets {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface UspsModeSecrets {
  consumerKey: string;
  consumerSecret: string;
}

export type ProviderModeSecrets = StripeModeSecrets | UspsModeSecrets;

/** Full decrypted secret blob: one field map per mode. */
interface SecretsBlob {
  test: Record<string, string>;
  live: Record<string, string>;
}

export interface UspsDefaultBox {
  weightOz: number;
  length: number;
  width: number;
  height: number;
}

export interface UspsHandling {
  type: 'flat' | 'percent';
  amount: number;
}

export interface UspsPublicConfig {
  originZip: string;
  enabledServices: string[];
  priceType: 'RETAIL' | 'COMMERCIAL';
  accountNumber: string;
  defaultBox: UspsDefaultBox;
  handling: UspsHandling;
}

/** Masked, secret-free view returned to the admin page/island. */
export interface MaskedIntegration {
  provider: IntegrationProvider;
  enabled: boolean;
  mode: IntegrationMode;
  /** { test: { field: '••••4242' }, live: { … } } — display only. */
  hints: Record<IntegrationMode, Record<string, string>>;
  publicConfig: Record<string, unknown>;
  updatedAt: string | null;
}

export type IntegrationResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: 'not_configured' | 'not_found' | 'unknown';
      message: string;
    };

const NOT_CONFIGURED_MSG =
  'Supabase service-role credentials are not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.';
const NO_ENCRYPTION_MSG =
  'APP_ENCRYPTION_KEY is not configured (need 32 bytes, base64). Add it to .env.local.';

interface DbRow {
  provider: IntegrationProvider;
  enabled: boolean;
  mode: IntegrationMode;
  secrets_encrypted: string | null;
  hints: Record<string, Record<string, string>> | null;
  public_config: Record<string, unknown> | null;
  updated_at: string | null;
}

const SECRET_FIELDS: Record<IntegrationProvider, readonly string[]> = {
  stripe: ['publishableKey', 'secretKey', 'webhookSecret'],
  usps: ['consumerKey', 'consumerSecret'],
};

function emptyBlob(): SecretsBlob {
  return { test: {}, live: {} };
}

function readBlob(row: DbRow | null): SecretsBlob {
  if (!row?.secrets_encrypted) return emptyBlob();
  try {
    const parsed = decryptJson<Partial<SecretsBlob>>(row.secrets_encrypted);
    return {
      test: parsed.test ?? {},
      live: parsed.live ?? {},
    };
  } catch (e) {
    console.error('[integration-settings] decrypt failed:', e instanceof Error ? e.message : e);
    return emptyBlob();
  }
}

function computeHints(
  provider: IntegrationProvider,
  blob: SecretsBlob,
): Record<IntegrationMode, Record<string, string>> {
  const fields = SECRET_FIELDS[provider];
  const forMode = (map: Record<string, string>) => {
    const out: Record<string, string> = {};
    for (const f of fields) out[f] = maskSecret(map[f]);
    return out;
  };
  return { test: forMode(blob.test), live: forMode(blob.live) };
}

async function fetchRow(provider: IntegrationProvider): Promise<DbRow | null> {
  const db = getAdminSupabase();
  if (!db) return null;
  const { data, error } = await db
    .from('integration_settings')
    .select('provider, enabled, mode, secrets_encrypted, hints, public_config, updated_at')
    .eq('provider', provider)
    .maybeSingle();
  if (error) {
    console.error('[integration-settings.fetchRow]', error.message);
    return null;
  }
  return (data as DbRow | null) ?? null;
}

// ---------------------------------------------------------------------------
// Reads (no decryption) — safe for the admin page.
// ---------------------------------------------------------------------------

export async function getMaskedIntegration(
  provider: IntegrationProvider,
): Promise<MaskedIntegration> {
  const fallback: MaskedIntegration = {
    provider,
    enabled: false,
    mode: 'test',
    hints: { test: {}, live: {} },
    publicConfig: {},
    updatedAt: null,
  };
  if (!isSupabaseAdminConfigured()) return fallback;
  const row = await fetchRow(provider);
  if (!row) return fallback;
  return {
    provider,
    enabled: row.enabled,
    mode: row.mode,
    hints: {
      test: row.hints?.test ?? {},
      live: row.hints?.live ?? {},
    },
    publicConfig: row.public_config ?? {},
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Decrypted reads — server-only consumers (test-connection, checkout/rating).
// ---------------------------------------------------------------------------

export async function getSecretsForMode(
  provider: IntegrationProvider,
  mode: IntegrationMode,
): Promise<Record<string, string> | null> {
  if (!isSupabaseAdminConfigured() || !isEncryptionConfigured()) return null;
  const row = await fetchRow(provider);
  if (!row) return null;
  const blob = readBlob(row);
  return blob[mode] ?? {};
}

export async function getActiveSecrets(
  provider: IntegrationProvider,
): Promise<{ mode: IntegrationMode; enabled: boolean; secrets: Record<string, string> } | null> {
  if (!isSupabaseAdminConfigured() || !isEncryptionConfigured()) return null;
  const row = await fetchRow(provider);
  if (!row) return null;
  const blob = readBlob(row);
  return { mode: row.mode, enabled: row.enabled, secrets: blob[row.mode] ?? {} };
}

/**
 * Full runtime config for the USPS integration — decrypted active-mode
 * credentials plus the (non-secret) shipping settings. Server-only; consumed
 * by the checkout rating service. `configured` is true only when the keys,
 * origin ZIP, and at least one service are present AND the integration is
 * enabled — callers fall back to flat-rate shipping otherwise.
 */
export interface UspsRuntimeConfig {
  configured: boolean;
  enabled: boolean;
  mode: IntegrationMode;
  consumerKey: string;
  consumerSecret: string;
  originZip: string;
  enabledServices: string[];
  priceType: 'RETAIL' | 'COMMERCIAL';
  accountNumber: string;
  defaultBox: UspsDefaultBox;
  handling: UspsHandling;
}

const DEFAULT_BOX: UspsDefaultBox = { weightOz: 16, length: 12, width: 10, height: 3 };
const DEFAULT_HANDLING: UspsHandling = { type: 'flat', amount: 0 };

export async function getUspsConfig(): Promise<UspsRuntimeConfig | null> {
  if (!isSupabaseAdminConfigured() || !isEncryptionConfigured()) return null;
  const row = await fetchRow('usps');
  if (!row) return null;
  const blob = readBlob(row);
  const secrets = blob[row.mode] ?? {};
  const pc = (row.public_config ?? {}) as Record<string, unknown>;

  const box = (pc.defaultBox ?? {}) as Record<string, unknown>;
  const handling = (pc.handling ?? {}) as Record<string, unknown>;
  const consumerKey = secrets.consumerKey ?? '';
  const consumerSecret = secrets.consumerSecret ?? '';
  const originZip = typeof pc.originZip === 'string' ? pc.originZip : '';
  const enabledServices = Array.isArray(pc.enabledServices)
    ? (pc.enabledServices as string[])
    : [];

  return {
    configured:
      row.enabled &&
      !!consumerKey &&
      !!consumerSecret &&
      !!originZip &&
      enabledServices.length > 0,
    enabled: row.enabled,
    mode: row.mode,
    consumerKey,
    consumerSecret,
    originZip,
    enabledServices,
    priceType: pc.priceType === 'COMMERCIAL' ? 'COMMERCIAL' : 'RETAIL',
    accountNumber: typeof pc.accountNumber === 'string' ? pc.accountNumber : '',
    defaultBox: {
      weightOz: Number(box.weightOz) || DEFAULT_BOX.weightOz,
      length: Number(box.length) || DEFAULT_BOX.length,
      width: Number(box.width) || DEFAULT_BOX.width,
      height: Number(box.height) || DEFAULT_BOX.height,
    },
    handling: {
      type: handling.type === 'percent' ? 'percent' : 'flat',
      amount: Number(handling.amount) || DEFAULT_HANDLING.amount,
    },
  };
}

// ---------------------------------------------------------------------------
// Writes — service role + encryption required.
// ---------------------------------------------------------------------------

/**
 * Merge non-empty secret fields into one mode's slot, re-encrypt the whole
 * blob, and refresh the masked hints. Blank/undefined inputs preserve the
 * existing stored value (so the operator can update one key without re-typing
 * the others).
 */
export async function upsertIntegrationSecrets(
  provider: IntegrationProvider,
  mode: IntegrationMode,
  partial: Record<string, string | undefined>,
  updatedBy: string | null,
): Promise<IntegrationResult> {
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, error: 'not_configured', message: NOT_CONFIGURED_MSG };
  }
  if (!isEncryptionConfigured()) {
    return { ok: false, error: 'not_configured', message: NO_ENCRYPTION_MSG };
  }
  const db = getAdminSupabase();
  if (!db) return { ok: false, error: 'not_configured', message: NOT_CONFIGURED_MSG };

  const row = await fetchRow(provider);
  const blob = readBlob(row);
  const fields = SECRET_FIELDS[provider];
  const next = { ...blob[mode] };
  for (const f of fields) {
    const v = partial[f];
    if (typeof v === 'string' && v.trim().length > 0) {
      next[f] = v.trim();
    }
  }
  blob[mode] = next;

  const { error } = await db
    .from('integration_settings')
    .update({
      secrets_encrypted: encryptJson(blob),
      hints: computeHints(provider, blob),
      updated_by: updatedBy,
    })
    .eq('provider', provider);
  if (error) {
    console.error('[integration-settings.upsertSecrets]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true, data: undefined };
}

export async function updatePublicConfig(
  provider: IntegrationProvider,
  patch: Record<string, unknown>,
  updatedBy: string | null,
): Promise<IntegrationResult> {
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, error: 'not_configured', message: NOT_CONFIGURED_MSG };
  }
  const db = getAdminSupabase();
  if (!db) return { ok: false, error: 'not_configured', message: NOT_CONFIGURED_MSG };

  const row = await fetchRow(provider);
  const merged = { ...(row?.public_config ?? {}), ...patch };
  const { error } = await db
    .from('integration_settings')
    .update({ public_config: merged, updated_by: updatedBy })
    .eq('provider', provider);
  if (error) {
    console.error('[integration-settings.updatePublicConfig]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true, data: undefined };
}

export async function setMode(
  provider: IntegrationProvider,
  mode: IntegrationMode,
  updatedBy: string | null,
): Promise<IntegrationResult> {
  return simpleUpdate(provider, { mode, updated_by: updatedBy });
}

export async function setEnabled(
  provider: IntegrationProvider,
  enabled: boolean,
  updatedBy: string | null,
): Promise<IntegrationResult> {
  return simpleUpdate(provider, { enabled, updated_by: updatedBy });
}

async function simpleUpdate(
  provider: IntegrationProvider,
  patch: Record<string, unknown>,
): Promise<IntegrationResult> {
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, error: 'not_configured', message: NOT_CONFIGURED_MSG };
  }
  const db = getAdminSupabase();
  if (!db) return { ok: false, error: 'not_configured', message: NOT_CONFIGURED_MSG };
  const { error } = await db
    .from('integration_settings')
    .update(patch)
    .eq('provider', provider);
  if (error) {
    console.error('[integration-settings.simpleUpdate]', error.message);
    return { ok: false, error: 'unknown', message: error.message };
  }
  return { ok: true, data: undefined };
}
