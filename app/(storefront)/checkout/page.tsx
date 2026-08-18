'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { CheckoutSection } from '@/components/checkout/CheckoutSection';
import { CheckoutFormField } from '@/components/checkout/CheckoutFormField';
import { useCart, selectSubtotal } from '@/lib/cart/store';
import { prepareCheckoutAction } from '@/lib/actions/checkout';
import type { PrepareCheckoutResult } from '@/lib/shipping/types';
import { cn } from '@/lib/utils/cn';

type Errors = Partial<Record<string, string>>;

const money = (n: number) => `$${n.toFixed(2)}`;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);

  const [form, setForm] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });
  const [payment, setPayment] = useState<'card' | 'other'>('card');
  const [billingSame, setBillingSame] = useState(true);
  const [errors, setErrors] = useState<Errors>({});

  // Shipping flow
  const [prep, setPrep] = useState<PrepareCheckoutResult | null>(null);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [loadingRates, startRates] = useTransition();

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    // Address edits invalidate a previous quote — force a refetch.
    if (['address1', 'address2', 'city', 'state', 'zip', 'country'].includes(k)) {
      setPrep(null);
      setSelectedShipId(null);
      setRateError(null);
    }
  }

  function validateAddressForm(): Errors {
    const e: Errors = {};
    const required: (keyof typeof form)[] = [
      'email', 'firstName', 'lastName', 'address1', 'city', 'state', 'zip',
    ];
    for (const k of required) if (!form[k].trim()) e[k] = 'Required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    return e;
  }

  const selectedOption = prep?.shipping.options.find((o) => o.id === selectedShipId) ?? null;
  const shippingAmount = selectedOption?.amount ?? null;
  const total = subtotal + (shippingAmount ?? 0);

  function getRates() {
    const v = validateAddressForm();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setRateError(null);
    startRates(async () => {
      try {
        const result = await prepareCheckoutAction({
          address: {
            firstName: form.firstName,
            lastName: form.lastName,
            address1: form.address1,
            address2: form.address2,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
          },
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        });
        setPrep(result);
        // Auto-select the cheapest (options are sorted ascending).
        setSelectedShipId(result.shipping.options[0]?.id ?? null);
      } catch {
        setRateError('Could not calculate shipping. Please try again.');
      }
    });
  }

  function useSuggestedAddress() {
    const std = prep?.address.standardized;
    if (!std) return;
    setForm((f) => ({
      ...f,
      address1: std.address1,
      address2: std.address2 ?? f.address2,
      city: std.city,
      state: std.state,
      zip: std.zip,
    }));
    // Corrected address — clear the quote so the shopper re-fetches for it.
    setPrep(null);
    setSelectedShipId(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validateAddressForm();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    // Payment is wired in the next phase. For now, preview the order.
    router.push('/checkout/confirmation?demo=1');
  }

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <p className="eyebrow mb-4 text-accent-ember">Checkout</p>
        <h1 className="text-h2 font-medium text-text-primary">Your cart is empty</h1>
        <a
          href="/women"
          className="mt-8 inline-flex min-h-[48px] items-center justify-center bg-text-primary px-7 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas"
        >
          Continue Shopping
        </a>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-16 lg:py-20">
      <header className="mb-10">
        <p className="eyebrow text-accent-ember">Checkout</p>
        <h1 className="mt-2 text-h2 font-medium text-text-primary md:text-h1">
          Secure checkout
        </h1>
        <div
          role="note"
          className="mt-6 border border-border-hairline bg-bg-subtle px-5 py-4 text-caption text-text-secondary"
        >
          <span className="eyebrow mr-2 text-accent-ember">Preview</span>
          Address verification and live USPS shipping are active. Card payment is
          the final step and is being wired next — no charge is made yet.
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10 lg:col-span-7">
          <CheckoutSection step={1} title="Contact" description="Order updates will be sent here.">
            <CheckoutFormField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              error={errors.email}
            />
            <CheckoutFormField
              label="Phone (optional)"
              type="tel"
              name="phone"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </CheckoutSection>

          <CheckoutSection step={2} title="Shipping Address">
            <div className="grid gap-5 md:grid-cols-2">
              <CheckoutFormField
                label="First name"
                name="firstName"
                autoComplete="given-name"
                required
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                error={errors.firstName}
              />
              <CheckoutFormField
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                required
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                error={errors.lastName}
              />
            </div>
            <CheckoutFormField
              label="Address line 1"
              name="address1"
              autoComplete="address-line1"
              required
              value={form.address1}
              onChange={(e) => set('address1', e.target.value)}
              error={errors.address1}
            />
            <CheckoutFormField
              label="Apartment, suite, etc. (optional)"
              name="address2"
              autoComplete="address-line2"
              value={form.address2}
              onChange={(e) => set('address2', e.target.value)}
            />
            <div className="grid gap-5 md:grid-cols-3">
              <CheckoutFormField
                label="City"
                name="city"
                autoComplete="address-level2"
                required
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                error={errors.city}
              />
              <CheckoutFormField
                label="State"
                name="state"
                autoComplete="address-level1"
                required
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
                error={errors.state}
              />
              <CheckoutFormField
                label="ZIP"
                name="zip"
                autoComplete="postal-code"
                required
                value={form.zip}
                onChange={(e) => set('zip', e.target.value)}
                error={errors.zip}
              />
            </div>
            <CheckoutFormField
              label="Country"
              name="country"
              autoComplete="country-name"
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
            />
          </CheckoutSection>

          <CheckoutSection
            step={3}
            title="Shipping Method"
            description="We verify your address with USPS and fetch live rates."
          >
            {!prep && (
              <button
                type="button"
                onClick={getRates}
                disabled={loadingRates}
                className="inline-flex min-h-[48px] items-center justify-center border border-text-primary px-6 text-caption font-medium uppercase tracking-[0.16em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-muted disabled:opacity-50"
              >
                {loadingRates ? 'Calculating…' : 'Get shipping options'}
              </button>
            )}

            {rateError && (
              <p className="text-caption text-state-danger" role="alert">{rateError}</p>
            )}

            {prep && (
              <div className="flex flex-col gap-4">
                <AddressFeedback prep={prep} onUseSuggested={useSuggestedAddress} />

                {prep.shipping.message && (
                  <p className="text-caption text-text-muted">{prep.shipping.message}</p>
                )}

                {prep.shipping.options.map((opt) => (
                  <RadioCard
                    key={opt.id}
                    name="shipping"
                    value={opt.id}
                    selected={selectedShipId === opt.id}
                    onSelect={() => setSelectedShipId(opt.id)}
                    title={opt.label}
                    meta={opt.estimatedDays}
                    price={money(opt.amount)}
                  />
                ))}

                <button
                  type="button"
                  onClick={getRates}
                  disabled={loadingRates}
                  className="self-start text-caption uppercase tracking-[0.12em] text-text-secondary underline underline-offset-4 hover:text-text-primary disabled:opacity-50"
                >
                  {loadingRates ? 'Recalculating…' : 'Recalculate'}
                </button>
              </div>
            )}
          </CheckoutSection>

          <CheckoutSection step={4} title="Payment" description="All transactions are secure and encrypted.">
            <RadioCard
              name="payment"
              value="card"
              selected={payment === 'card'}
              onSelect={() => setPayment('card')}
              title="Credit / Debit Card"
              meta="Visa, Mastercard, Amex"
            />
            <RadioCard
              name="payment"
              value="other"
              selected={payment === 'other'}
              onSelect={() => setPayment('other')}
              title="Other"
              meta="Additional methods available soon"
            />
          </CheckoutSection>

          <CheckoutSection step={5} title="Billing Address">
            <label className="flex cursor-pointer items-center gap-3 text-body text-text-primary">
              <input
                type="checkbox"
                checked={billingSame}
                onChange={(e) => setBillingSame(e.target.checked)}
                className="h-4 w-4 accent-text-primary"
              />
              Same as shipping address
            </label>
            {!billingSame && (
              <div className="mt-2 grid gap-5 border-t border-border-hairline pt-5 md:grid-cols-2">
                <CheckoutFormField label="Billing first name" name="billingFirst" />
                <CheckoutFormField label="Billing last name" name="billingLast" />
              </div>
            )}
          </CheckoutSection>

          <button
            type="submit"
            className="mt-4 flex min-h-[56px] items-center justify-center bg-text-primary px-7 text-caption font-medium uppercase tracking-[0.16em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
          >
            Preview Order Summary
          </button>
          <p className="text-caption text-text-muted">
            Preview mode — card payment is being wired next, so no charge is made
            and no order is placed yet.
          </p>
        </form>

        <div className="lg:col-span-5">
          <aside className="lg:sticky lg:top-28 border border-border-hairline bg-bg-canvas p-6">
            <h2 className="text-body-lg font-medium text-text-primary">Order summary</h2>
            <ul className="mt-5 flex flex-col gap-4 border-b border-border-hairline pb-5">
              {items.map((it) => (
                <li key={it.id} className="flex items-start justify-between gap-4 text-caption">
                  <span className="text-text-secondary">
                    {it.name}
                    {(it.variant.size || it.variant.color) && (
                      <span className="text-text-muted">
                        {' '}· {[it.variant.size, it.variant.color].filter(Boolean).join(' / ')}
                      </span>
                    )}
                    <span className="text-text-muted"> × {it.quantity}</span>
                  </span>
                  <span className="nums-tabular text-text-primary">
                    {money(it.price * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 flex flex-col gap-3 text-caption">
              <Row label="Subtotal" value={money(subtotal)} />
              <Row
                label="Shipping"
                value={
                  shippingAmount != null
                    ? money(shippingAmount)
                    : 'Calculated in step 3'
                }
              />
              <div className="mt-2 flex items-center justify-between border-t border-border-hairline pt-4 text-body font-medium text-text-primary">
                <span>Total</span>
                <span className="nums-tabular">{money(total)}</span>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="nums-tabular text-text-primary">{value}</dd>
    </div>
  );
}

function AddressFeedback({
  prep,
  onUseSuggested,
}: {
  prep: PrepareCheckoutResult;
  onUseSuggested: () => void;
}) {
  const { status, standardized, message } = prep.address;

  if (status === 'confirmed') {
    return (
      <p className="text-caption text-state-success">✓ Address confirmed by USPS.</p>
    );
  }
  if (status === 'corrected' && standardized) {
    return (
      <div className="border border-accent-ember/40 bg-accent-ember/5 px-4 py-3 text-caption text-text-secondary">
        <p className="font-medium text-text-primary">USPS suggests a standardized address:</p>
        <p className="mt-1">
          {standardized.address1}
          {standardized.address2 ? `, ${standardized.address2}` : ''}, {standardized.city},{' '}
          {standardized.state} {standardized.zip}
        </p>
        <button
          type="button"
          onClick={onUseSuggested}
          className="mt-2 inline-flex h-9 items-center border border-accent-ember px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-ember hover:bg-accent-ember/10"
        >
          Use suggested address
        </button>
      </div>
    );
  }
  if (status === 'undeliverable') {
    return (
      <p className="border border-state-danger/40 bg-state-danger/5 px-4 py-3 text-caption text-state-danger">
        {message ?? 'USPS could not confirm this address.'}
      </p>
    );
  }
  if (status === 'unverified' || status === 'skipped') {
    return message ? (
      <p className="text-caption text-text-muted">{message}</p>
    ) : null;
  }
  return null;
}

function RadioCard({
  name,
  value,
  selected,
  onSelect,
  title,
  meta,
  price,
}: {
  name: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
  title: string;
  meta: string;
  price?: string;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between border px-5 py-4 transition-colors duration-fast ease-standard',
        selected
          ? 'border-text-primary bg-bg-muted'
          : 'border-border-hairline bg-bg-canvas hover:border-text-primary',
      )}
    >
      <div className="flex items-center gap-4">
        <input
          type="radio"
          name={name}
          value={value}
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 accent-text-primary"
        />
        <div>
          <p className="text-body font-medium text-text-primary">{title}</p>
          {meta && <p className="text-caption text-text-muted">{meta}</p>}
        </div>
      </div>
      {price && (
        <span className="text-body font-medium text-text-primary nums-tabular">
          {price}
        </span>
      )}
    </label>
  );
}
