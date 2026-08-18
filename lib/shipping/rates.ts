/**
 * Checkout shipping rating (server-only).
 *
 * Builds ONE combined package from the cart — sums each item's weight
 * (falling back to the USPS default-box weight when a product has none) and
 * uses the default box dimensions — then asks USPS for a live price per
 * enabled mail class. Applies the configured handling fee. Falls back to a
 * flat rate when USPS isn't configured/enabled or every rate call fails, so
 * checkout never dead-ends.
 */

import 'server-only';

import { getServerSupabase } from '@/lib/supabase/server';
import { getUspsConfig } from '@/lib/repositories/integration-settings';
import { getBaseRate } from '@/lib/integrations/usps';
import type { ShippingOption, ShippingQuote } from './types';

export interface CartItemInput {
  productId: string;
  quantity: number;
}

/** Flat fallback used when live USPS rates aren't available. */
const FLAT_RATE_USD = 7.99;
const FLAT_OPTION: ShippingOption = {
  id: 'flat',
  label: 'Standard shipping',
  amount: FLAT_RATE_USD,
  estimatedDays: '5–7 business days',
};

const SERVICE_META: Record<string, { label: string; estimatedDays: string }> = {
  USPS_GROUND_ADVANTAGE: { label: 'USPS Ground Advantage', estimatedDays: '2–5 business days' },
  PRIORITY_MAIL: { label: 'USPS Priority Mail', estimatedDays: '1–3 business days' },
  PRIORITY_MAIL_EXPRESS: { label: 'USPS Priority Mail Express', estimatedDays: '1–2 business days' },
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function applyHandling(
  base: number,
  handling: { type: 'flat' | 'percent'; amount: number },
): number {
  if (!handling.amount) return round2(base);
  return handling.type === 'percent'
    ? round2(base * (1 + handling.amount / 100))
    : round2(base + handling.amount);
}

interface ProductShipRow {
  id: string;
  weight_oz: number | null;
}

/** Sum cart weight (oz), using the default-box weight for products with none. */
async function totalWeightOz(
  items: CartItemInput[],
  defaultWeightOz: number,
): Promise<number> {
  const db = getServerSupabase();
  const ids = items.map((i) => i.productId).filter(Boolean);
  let weights = new Map<string, number | null>();
  if (db && ids.length > 0) {
    const { data, error } = await db
      .from('products')
      .select('id, weight_oz')
      .in('id', ids);
    if (!error && data) {
      weights = new Map((data as ProductShipRow[]).map((r) => [r.id, r.weight_oz]));
    }
  }
  let oz = 0;
  for (const item of items) {
    const w = weights.get(item.productId);
    const per = w != null && w > 0 ? Number(w) : defaultWeightOz;
    oz += per * Math.max(1, item.quantity);
  }
  return oz;
}

export async function quoteShipping(args: {
  items: CartItemInput[];
  destZip: string;
}): Promise<ShippingQuote> {
  const { items, destZip } = args;

  const cfg = await getUspsConfig();
  if (!cfg || !cfg.configured || !destZip.trim()) {
    return {
      options: [FLAT_OPTION],
      source: 'flat',
      message: !cfg?.configured
        ? 'Live USPS rates are not configured yet — showing standard shipping.'
        : undefined,
    };
  }

  const weightOz = await totalWeightOz(items, cfg.defaultBox.weightOz);
  const weightLbs = weightOz / 16;

  const results = await Promise.all(
    cfg.enabledServices.map(async (mailClass) => {
      const res = await getBaseRate(cfg.mode, {
        consumerKey: cfg.consumerKey,
        consumerSecret: cfg.consumerSecret,
      }, {
        originZip: cfg.originZip,
        destZip: destZip.trim(),
        weightLbs,
        length: cfg.defaultBox.length,
        width: cfg.defaultBox.width,
        height: cfg.defaultBox.height,
        mailClass,
        priceType: cfg.priceType,
        accountNumber: cfg.accountNumber || undefined,
      });
      if (!res.ok) {
        console.error('[rates]', mailClass, res.message);
        return null;
      }
      const meta = SERVICE_META[mailClass] ?? { label: mailClass, estimatedDays: '' };
      const option: ShippingOption = {
        id: mailClass,
        label: meta.label,
        amount: applyHandling(res.data, cfg.handling),
        estimatedDays: meta.estimatedDays,
      };
      return option;
    }),
  );

  const options = results
    .filter((o): o is ShippingOption => o !== null)
    .sort((a, b) => a.amount - b.amount);

  if (options.length === 0) {
    return {
      options: [FLAT_OPTION],
      source: 'flat',
      message: 'USPS did not return any rates — showing standard shipping.',
    };
  }

  return { options, source: 'usps' };
}
