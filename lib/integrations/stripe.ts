/**
 * Stripe runtime (server-only).
 *
 * Builds a Stripe client from the owner's active-mode secret key stored
 * encrypted in the Integrations panel — never from env. Returns null when
 * Stripe isn't configured/enabled so callers can degrade gracefully.
 */

import 'server-only';

import Stripe from 'stripe';
import {
  getActiveSecrets,
  type IntegrationMode,
} from '@/lib/repositories/integration-settings';

export interface StripeRuntime {
  stripe: Stripe;
  publishableKey: string;
  webhookSecret: string;
  mode: IntegrationMode;
}

export async function getStripeRuntime(): Promise<StripeRuntime | null> {
  const active = await getActiveSecrets('stripe');
  if (!active || !active.enabled) return null;
  const secretKey = active.secrets.secretKey;
  if (!secretKey) return null;
  return {
    stripe: new Stripe(secretKey),
    publishableKey: active.secrets.publishableKey ?? '',
    webhookSecret: active.secrets.webhookSecret ?? '',
    mode: active.mode,
  };
}
