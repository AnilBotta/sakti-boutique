'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { CheckoutSection } from '@/components/checkout/CheckoutSection';
import { CheckoutFormField } from '@/components/checkout/CheckoutFormField';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { useCart } from '@/lib/cart/store';
import { cn } from '@/lib/utils/cn';

type Errors = Partial<Record<string, string>>;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);

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
  const [delivery, setDelivery] = useState<'standard' | 'express'>('standard');
  const [payment, setPayment] = useState<'card' | 'other'>('card');
  const [billingSame, setBillingSame] = useState(true);
  const [errors, setErrors] = useState<Errors>({});

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate(): Errors {
    const e: Errors = {};
    const required: (keyof typeof form)[] = [
      'email', 'firstName', 'lastName', 'address1', 'city', 'state', 'zip',
    ];
    for (const k of required) if (!form[k].trim()) e[k] = 'Required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    return e;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    // Demo-only transition. No order is created, no payment is processed.
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
          This checkout is a design preview. No payment is processed and no order is placed.
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

          <CheckoutSection step={3} title="Delivery Method">
            <RadioCard
              name="delivery"
              value="standard"
              selected={delivery === 'standard'}
              onSelect={() => setDelivery('standard')}
              title="Standard"
              meta="5–7 business days"
              price="Free"
            />
            <RadioCard
              name="delivery"
              value="express"
              selected={delivery === 'express'}
              onSelect={() => setDelivery('express')}
              title="Express"
              meta="2–3 business days"
              price="$24"
            />
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
            Preview mode — no payment is processed and no order is placed. Live checkout will be available soon.
          </p>
        </form>

        <div className="lg:col-span-5">
          <CheckoutOrderSummary />
        </div>
      </div>
    </Container>
  );
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
          <p className="text-caption text-text-muted">{meta}</p>
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
