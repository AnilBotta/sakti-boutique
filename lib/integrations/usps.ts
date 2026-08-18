/**
 * USPS APIs v3 client (server-only).
 *
 * Two jobs for checkout:
 *   - validateAddress(): standardize + confirm a US delivery address
 *   - getBaseRate():     live postage price for one mail class + parcel
 *
 * OAuth 2.0 client-credentials: the owner's consumer key/secret (stored
 * encrypted, read via lib/repositories/integration-settings) exchange for an
 * ~8h bearer token, cached in-module and keyed by consumer key so a key
 * rotation naturally invalidates the cache.
 *
 * Hosts: production `apis.usps.com`, test/CAT `apis-tem.usps.com`. The mode
 * comes from the Integrations panel (test vs live).
 */

import 'server-only';

import type { IntegrationMode } from '@/lib/repositories/integration-settings';

export interface UspsCreds {
  consumerKey: string;
  consumerSecret: string;
}

function host(mode: IntegrationMode): string {
  return mode === 'live' ? 'https://apis.usps.com' : 'https://apis-tem.usps.com';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// -- OAuth token cache -------------------------------------------------------

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getToken(
  mode: IntegrationMode,
  creds: UspsCreds,
): Promise<string | null> {
  const cacheKey = `${mode}:${creds.consumerKey}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

  try {
    const res = await fetch(`${host(mode)}/oauth2/v3/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: creds.consumerKey,
        client_secret: creds.consumerSecret,
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[usps.getToken]', res.status, (await res.text().catch(() => '')).slice(0, 200));
      return null;
    }
    const json = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!json.access_token) return null;
    tokenCache.set(cacheKey, {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 28800) * 1000,
    });
    return json.access_token;
  } catch (e) {
    console.error('[usps.getToken]', e instanceof Error ? e.message : e);
    return null;
  }
}

// -- Address validation ------------------------------------------------------

export interface UspsAddressInput {
  streetAddress: string;
  secondaryAddress?: string;
  city: string;
  state: string;
  ZIPCode: string;
}

export interface UspsValidatedAddress {
  streetAddress: string;
  secondaryAddress?: string;
  city: string;
  state: string;
  ZIPCode: string;
  ZIPPlus4?: string;
  dpvConfirmation?: string;
  /** True when USPS confirms the address is deliverable (DPV 'Y' or 'D'). */
  deliverable: boolean;
}

export type UspsResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export async function validateAddress(
  mode: IntegrationMode,
  creds: UspsCreds,
  addr: UspsAddressInput,
): Promise<UspsResult<UspsValidatedAddress>> {
  const token = await getToken(mode, creds);
  if (!token) return { ok: false, message: 'USPS authentication failed.' };

  const params = new URLSearchParams({
    streetAddress: addr.streetAddress,
    city: addr.city,
    state: addr.state,
    ZIPCode: addr.ZIPCode,
  });
  if (addr.secondaryAddress) params.set('secondaryAddress', addr.secondaryAddress);

  try {
    const res = await fetch(`${host(mode)}/addresses/v3/address?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: `USPS address check failed (HTTP ${res.status}). ${t.slice(0, 160)}` };
    }
    const json = (await res.json()) as {
      address?: Partial<UspsValidatedAddress> & { ZIPPlus4?: string };
      additionalInfo?: { DPVConfirmation?: string };
    };
    const a = json.address ?? {};
    const dpv = json.additionalInfo?.DPVConfirmation;
    return {
      ok: true,
      data: {
        streetAddress: a.streetAddress ?? addr.streetAddress,
        secondaryAddress: a.secondaryAddress ?? addr.secondaryAddress,
        city: a.city ?? addr.city,
        state: a.state ?? addr.state,
        ZIPCode: a.ZIPCode ?? addr.ZIPCode,
        ZIPPlus4: a.ZIPPlus4,
        dpvConfirmation: dpv,
        deliverable: dpv === 'Y' || dpv === 'D',
      },
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'USPS address check failed.' };
  }
}

// -- Rating ------------------------------------------------------------------

export interface UspsRateInput {
  originZip: string;
  destZip: string;
  weightLbs: number;
  length: number;
  width: number;
  height: number;
  mailClass: string;
  priceType: 'RETAIL' | 'COMMERCIAL';
  accountNumber?: string;
}

function extractPrice(json: unknown): number | null {
  const j = json as Record<string, unknown>;
  if (typeof j.totalBasePrice === 'number') return j.totalBasePrice;
  if (typeof j.price === 'number') return j.price;
  const rates = j.rates;
  if (Array.isArray(rates) && rates.length > 0) {
    const r = rates[0] as Record<string, unknown>;
    if (typeof r.price === 'number') return r.price;
    if (typeof r.totalBasePrice === 'number') return r.totalBasePrice;
  }
  return null;
}

/**
 * Base postage for one mail class. Returns the price in US dollars.
 * `processingCategory`/`rateIndicator` use the common single-piece parcel
 * defaults (MACHINABLE / SP); USPS returns an error we surface if a parcel
 * doesn't qualify, and the rating service simply skips that service.
 */
export async function getBaseRate(
  mode: IntegrationMode,
  creds: UspsCreds,
  input: UspsRateInput,
): Promise<UspsResult<number>> {
  const token = await getToken(mode, creds);
  if (!token) return { ok: false, message: 'USPS authentication failed.' };

  const body: Record<string, unknown> = {
    originZIPCode: input.originZip,
    destinationZIPCode: input.destZip,
    weight: round2(Math.max(input.weightLbs, 0.01)),
    length: input.length,
    width: input.width,
    height: input.height,
    mailClass: input.mailClass,
    processingCategory: 'MACHINABLE',
    rateIndicator: 'SP',
    destinationEntryFacilityType: 'NONE',
    priceType: input.priceType,
    mailingDate: todayIso(),
  };
  if (input.priceType === 'COMMERCIAL' && input.accountNumber) {
    body.accountType = 'EPS';
    body.accountNumber = input.accountNumber;
  }

  try {
    const res = await fetch(`${host(mode)}/prices/v3/base-rates/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, message: `USPS rate failed for ${input.mailClass} (HTTP ${res.status}). ${t.slice(0, 200)}` };
    }
    const json = await res.json();
    const price = extractPrice(json);
    if (price == null) {
      console.error('[usps.getBaseRate] unparseable response', JSON.stringify(json).slice(0, 400));
      return { ok: false, message: `Could not parse USPS price for ${input.mailClass}.` };
    }
    return { ok: true, data: price };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'USPS rate request failed.' };
  }
}
