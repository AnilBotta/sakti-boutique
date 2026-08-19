/**
 * Shared shipping types — safe to import from client and server.
 * (No secrets, no server-only imports.)
 */

export interface ShippingOption {
  /** Stable id, e.g. the USPS mail class or 'flat'. */
  id: string;
  /** Display label, e.g. "USPS Ground Advantage". */
  label: string;
  /** Cost in US dollars (2-decimal). */
  amount: number;
  /** Human delivery estimate, e.g. "2–5 business days". */
  estimatedDays: string;
}

export interface ShippingQuote {
  options: ShippingOption[];
  /** 'usps' = live rates; 'flat' = fallback (USPS unconfigured or all calls failed). */
  source: 'usps' | 'flat';
  message?: string;
}

export interface CheckoutAddressInput {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface StandardizedAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
}

export type AddressStatus =
  | 'confirmed' // USPS confirmed as entered
  | 'corrected' // USPS standardized to a different value (shown for confirmation)
  | 'unverified' // USPS call failed / entitlement issue — allow anyway
  | 'undeliverable' // USPS says not deliverable
  | 'skipped'; // non-US or USPS not configured

export interface AddressValidation {
  status: AddressStatus;
  standardized?: StandardizedAddress;
  message?: string;
}

export interface PrepareCheckoutResult {
  address: AddressValidation;
  shipping: ShippingQuote;
}
