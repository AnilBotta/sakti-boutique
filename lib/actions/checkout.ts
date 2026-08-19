'use server';

/**
 * Customer-facing checkout preparation.
 *
 * Validates the shipping address with USPS and quotes live shipping rates in
 * one call. Runs entirely server-side — the USPS secret key never reaches the
 * browser; only the standardized address and rate options are returned.
 *
 * Public action (no admin gate): it exposes no secrets and re-fetches product
 * weights from the DB rather than trusting the client.
 */

import { headers } from 'next/headers';
import { getUspsConfig } from '@/lib/repositories/integration-settings';
import { validateAddress } from '@/lib/integrations/usps';
import { quoteShipping, type CartItemInput } from '@/lib/shipping/rates';
import { getStripeRuntime } from '@/lib/integrations/stripe';
import { priceCart, type CheckoutItemInput } from '@/lib/checkout/pricing';
import { createPendingOrder } from '@/lib/checkout/orders';
import { siteConfig } from '@/lib/site/config';
import type {
  CheckoutAddressInput,
  PrepareCheckoutResult,
  AddressValidation,
} from '@/lib/shipping/types';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isUsCountry(country: string): boolean {
  const c = (country ?? '').trim().toLowerCase();
  return c === '' || c === 'us' || c === 'usa' || c === 'united states' || c === 'united states of america';
}

export async function prepareCheckoutAction(input: {
  address: CheckoutAddressInput;
  items: CartItemInput[];
}): Promise<PrepareCheckoutResult> {
  const { address, items } = input;
  const isUS = isUsCountry(address.country);

  let addressValidation: AddressValidation = { status: 'skipped' };

  const cfg = await getUspsConfig();

  if (!isUS) {
    addressValidation = {
      status: 'skipped',
      message: 'Address verification is available for US addresses only.',
    };
  } else if (cfg && cfg.configured) {
    const res = await validateAddress(
      cfg.mode,
      { consumerKey: cfg.consumerKey, consumerSecret: cfg.consumerSecret },
      {
        streetAddress: address.address1,
        secondaryAddress: address.address2 || undefined,
        city: address.city,
        state: address.state,
        ZIPCode: address.zip,
      },
    );
    if (!res.ok) {
      addressValidation = { status: 'unverified', message: res.message };
    } else if (!res.data.deliverable) {
      addressValidation = {
        status: 'undeliverable',
        message:
          "USPS couldn't confirm this address is deliverable. Double-check it, or continue if you're sure it's correct.",
      };
    } else {
      const std = {
        address1: res.data.streetAddress,
        address2: res.data.secondaryAddress,
        city: res.data.city,
        state: res.data.state,
        zip: res.data.ZIPCode,
      };
      const differs =
        std.address1.trim().toUpperCase() !== address.address1.trim().toUpperCase() ||
        std.city.trim().toUpperCase() !== address.city.trim().toUpperCase() ||
        std.state.trim().toUpperCase() !== address.state.trim().toUpperCase() ||
        std.zip.trim() !== address.zip.trim();
      addressValidation = differs
        ? { status: 'corrected', standardized: std }
        : { status: 'confirmed', standardized: std };
    }
  }

  const shipping = await quoteShipping({ items, destZip: address.zip });
  return { address: addressValidation, shipping };
}

// ---------------------------------------------------------------------------
// Start payment — re-price server-side, create a pending order, and open a
// Stripe Hosted Checkout session. Returns the URL to redirect the browser to.
// ---------------------------------------------------------------------------

export type StartCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function startCheckoutAction(input: {
  contact: { email: string; phone?: string };
  address: CheckoutAddressInput;
  items: CheckoutItemInput[];
  shippingOptionId: string;
}): Promise<StartCheckoutResult> {
  const { contact, address, items, shippingOptionId } = input;

  // 1. Re-price the cart from the DB (never trust client prices).
  const priced = await priceCart(items);
  if (!priced || priced.lines.length === 0) {
    return { ok: false, message: 'We could not price your cart. Please refresh and try again.' };
  }

  // 2. Re-quote shipping server-side and use the server's amount for the
  //    selected option (prevents tampering with the shipping price).
  const quote = await quoteShipping({
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    destZip: address.zip,
  });
  const option =
    quote.options.find((o) => o.id === shippingOptionId) ?? quote.options[0];
  if (!option) {
    return { ok: false, message: 'Please choose a shipping option.' };
  }

  const subtotal = priced.subtotal;
  const shipping = option.amount;
  const tax = 0;
  const grandTotal = round2(subtotal + shipping + tax);

  // 3. Stripe must be configured.
  const rt = await getStripeRuntime();
  if (!rt) {
    return { ok: false, message: 'Card payment is not available yet. Please check back soon.' };
  }

  // 4. Create the pending order.
  const fullName = `${address.firstName} ${address.lastName}`.trim();
  const created = await createPendingOrder({
    email: contact.email,
    phone: contact.phone,
    fullName,
    address: {
      fullName,
      line1: address.address1,
      line2: address.address2,
      city: address.city,
      region: address.state,
      postalCode: address.zip,
      country: address.country || 'United States',
      phone: contact.phone,
    },
    lines: priced.lines,
    subtotal,
    shipping,
    tax,
    grandTotal,
  });
  if (!created.ok) {
    return { ok: false, message: created.message };
  }

  // 5. Stripe Hosted Checkout session.
  const origin = headers().get('origin') || siteConfig.url;
  try {
    const session = await rt.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: contact.email,
      line_items: [
        ...priced.lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(l.unitPrice * 100),
            product_data: {
              name: l.variantLabel ? `${l.name} (${l.variantLabel})` : l.name,
            },
          },
        })),
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(shipping * 100),
            product_data: { name: `Shipping — ${option.label}` },
          },
        },
      ],
      metadata: {
        order_id: created.orderId,
        order_number: created.orderNumber,
      },
      success_url: `${origin}/checkout/confirmation?order=${created.orderNumber}`,
      cancel_url: `${origin}/checkout`,
    });
    if (!session.url) {
      return { ok: false, message: 'Could not start payment. Please try again.' };
    }
    return { ok: true, url: session.url };
  } catch (e) {
    console.error('[startCheckoutAction] stripe', e instanceof Error ? e.message : e);
    return { ok: false, message: 'Payment could not be started. Please try again.' };
  }
}
