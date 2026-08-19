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

import { getUspsConfig } from '@/lib/repositories/integration-settings';
import { validateAddress } from '@/lib/integrations/usps';
import { quoteShipping, type CartItemInput } from '@/lib/shipping/rates';
import type {
  CheckoutAddressInput,
  PrepareCheckoutResult,
  AddressValidation,
} from '@/lib/shipping/types';

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
