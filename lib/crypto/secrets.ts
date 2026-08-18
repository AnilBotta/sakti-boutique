/**
 * Secret encryption seam.
 *
 * Owner-entered third-party API keys (Stripe, USPS) are stored in the
 * `integration_settings` table encrypted at rest with AES-256-GCM. This module
 * is the ONLY place that encrypts/decrypts them, and it is `server-only` so the
 * master key and plaintext secrets can never reach the browser bundle.
 *
 * Master key (add to .env.local and Vercel project settings, server-only):
 *   APP_ENCRYPTION_KEY   # 32 bytes, base64 — generate with: openssl rand -base64 32
 *
 * Blob format: `v1.<iv_b64>.<authTag_b64>.<ciphertext_b64>`.
 * GCM's auth tag makes tampering detectable — `decryptJson` throws if the blob
 * was altered or the wrong key is used.
 */

import 'server-only';

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12; // 96-bit nonce, the GCM standard
const KEY_BYTES = 32; // AES-256
const BLOB_VERSION = 'v1';

export interface EncryptionEnv {
  key: string | null;
}

export function readEncryptionEnv(): EncryptionEnv {
  return {
    key: process.env.APP_ENCRYPTION_KEY ?? null,
  };
}

/** Decode the configured master key to raw bytes, or null when unusable. */
function readKeyBytes(): Buffer | null {
  const { key } = readEncryptionEnv();
  if (!key) return null;
  let buf: Buffer;
  try {
    buf = Buffer.from(key, 'base64');
  } catch {
    return null;
  }
  return buf.length === KEY_BYTES ? buf : null;
}

/** True only when APP_ENCRYPTION_KEY is present and decodes to 32 bytes. */
export function isEncryptionConfigured(): boolean {
  return readKeyBytes() !== null;
}

/**
 * Encrypt an arbitrary JSON-serializable value into a self-describing blob.
 * Throws when the master key is missing/invalid — callers guard with
 * `isEncryptionConfigured()` and surface a typed `not_configured` result.
 */
export function encryptJson(value: unknown): string {
  const key = readKeyBytes();
  if (!key) {
    throw new Error('APP_ENCRYPTION_KEY is not configured (need 32 bytes, base64).');
  }
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [
    BLOB_VERSION,
    iv.toString('base64'),
    authTag.toString('base64'),
    ciphertext.toString('base64'),
  ].join('.');
}

/**
 * Decrypt a blob produced by `encryptJson`. Throws on a missing key, malformed
 * blob, or a failed auth tag (tampering / wrong key).
 */
export function decryptJson<T = unknown>(blob: string): T {
  const key = readKeyBytes();
  if (!key) {
    throw new Error('APP_ENCRYPTION_KEY is not configured (need 32 bytes, base64).');
  }
  const parts = blob.split('.');
  if (parts.length !== 4 || parts[0] !== BLOB_VERSION) {
    throw new Error('Malformed secret blob.');
  }
  const [, ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ctB64, 'base64');
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString('utf8')) as T;
}

/**
 * Masked display of a secret for the admin UI — the last 4 characters behind
 * bullets. Never returns the full value. Empty/short inputs mask fully.
 */
export function maskSecret(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.length <= 4) return '••••';
  return `••••${trimmed.slice(-4)}`;
}
