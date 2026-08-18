'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';
import type {
  MaskedIntegration,
  IntegrationMode,
} from '@/lib/repositories/integration-settings';
import {
  saveStripeKeysAction,
  saveUspsKeysAction,
  saveUspsShippingAction,
  setIntegrationModeAction,
  setIntegrationEnabledAction,
  testStripeConnectionAction,
  testUspsConnectionAction,
  type IntegrationActionResult,
} from '@/lib/actions/admin-integrations';

const USPS_SERVICES = [
  { value: 'USPS_GROUND_ADVANTAGE', label: 'Ground Advantage', meta: '2–5 business days' },
  { value: 'PRIORITY_MAIL', label: 'Priority Mail', meta: '1–3 business days' },
  { value: 'PRIORITY_MAIL_EXPRESS', label: 'Priority Mail Express', meta: '1–2 days, guaranteed' },
] as const;

interface Props {
  stripe: MaskedIntegration;
  usps: MaskedIntegration;
  ready: boolean;
}

export function IntegrationsClient({ stripe, usps, ready }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {!ready && (
        <div className="flex items-start gap-3 border border-accent-ember/40 bg-accent-ember/5 px-5 py-4 text-caption text-text-secondary">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-ember" strokeWidth={1.5} />
          <div>
            <p className="font-medium text-text-primary">Setup incomplete — saving is disabled</p>
            <p className="mt-1">
              This panel needs <code>SUPABASE_SERVICE_ROLE_KEY</code> and{' '}
              <code>APP_ENCRYPTION_KEY</code> (32 bytes, base64) in the server
              environment before keys can be stored encrypted. Add them to{' '}
              <code>.env.local</code> and the Vercel project settings.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 border border-border-hairline bg-bg-subtle px-5 py-4 text-caption text-text-secondary">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-state-success" strokeWidth={1.5} />
        <p>
          Keys are encrypted at rest and used only on the server — they are never
          sent to browsers or shown in full. Existing keys display as{' '}
          <code>••••1234</code>; leave a field blank to keep the stored value.
        </p>
      </div>

      <StripeCard integration={stripe} disabled={!ready} />
      <UspsCard integration={usps} disabled={!ready} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

function StripeCard({ integration, disabled }: { integration: MaskedIntegration; disabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editMode, setEditMode] = useState<IntegrationMode>(integration.mode);
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [result, setResult] = useState<IntegrationActionResult | null>(null);
  const [test, setTest] = useState<IntegrationActionResult | null>(null);

  const hints = integration.hints[editMode] ?? {};

  function run(fn: () => Promise<IntegrationActionResult>, after?: () => void) {
    setResult(null);
    startTransition(async () => {
      const res = await fn();
      setResult(res);
      if (res.ok) {
        after?.();
        router.refresh();
      }
    });
  }

  return (
    <AdminSectionCard
      title="Stripe"
      description="Card payments. Enter your own Stripe keys — Hosted Checkout keeps card data off this site."
    >
      <div className="flex flex-col gap-6 p-6">
        <TopControls
          provider="stripe"
          integration={integration}
          disabled={disabled || pending}
          onChanged={() => router.refresh()}
        />

        <EditModeTabs value={editMode} onChange={(m) => { setEditMode(m); setResult(null); setTest(null); }} />

        <div className="grid gap-4">
          <SecretField
            label="Publishable key"
            placeholder={editMode === 'live' ? 'pk_live_…' : 'pk_test_…'}
            hint={hints.publishableKey}
            value={publishableKey}
            onChange={setPublishableKey}
            disabled={disabled || pending}
          />
          <SecretField
            label="Secret key"
            placeholder={editMode === 'live' ? 'sk_live_…' : 'sk_test_…'}
            hint={hints.secretKey}
            value={secretKey}
            onChange={setSecretKey}
            disabled={disabled || pending}
          />
          <SecretField
            label="Webhook signing secret"
            placeholder="whsec_…"
            hint={hints.webhookSecret}
            value={webhookSecret}
            onChange={setWebhookSecret}
            disabled={disabled || pending}
          />
        </div>

        <ActionRow
          disabled={disabled || pending}
          onSave={() =>
            run(
              () =>
                saveStripeKeysAction({
                  mode: editMode,
                  publishableKey: publishableKey || undefined,
                  secretKey: secretKey || undefined,
                  webhookSecret: webhookSecret || undefined,
                }),
              () => {
                setPublishableKey('');
                setSecretKey('');
                setWebhookSecret('');
              },
            )
          }
          onTest={() =>
            startTransition(async () => {
              setTest(null);
              setTest(await testStripeConnectionAction(editMode));
            })
          }
        />

        <Results result={result} test={test} />
      </div>
    </AdminSectionCard>
  );
}

// ---------------------------------------------------------------------------
// USPS
// ---------------------------------------------------------------------------

interface UspsShipping {
  originZip: string;
  enabledServices: string[];
  priceType: 'RETAIL' | 'COMMERCIAL';
  accountNumber: string;
  defaultBox: { weightOz: number; length: number; width: number; height: number };
  handling: { type: 'flat' | 'percent'; amount: number };
}

function readUspsShipping(pc: Record<string, unknown>): UspsShipping {
  const box = (pc.defaultBox ?? {}) as Record<string, unknown>;
  const handling = (pc.handling ?? {}) as Record<string, unknown>;
  return {
    originZip: typeof pc.originZip === 'string' ? pc.originZip : '',
    enabledServices: Array.isArray(pc.enabledServices)
      ? (pc.enabledServices as string[])
      : ['USPS_GROUND_ADVANTAGE'],
    priceType: pc.priceType === 'COMMERCIAL' ? 'COMMERCIAL' : 'RETAIL',
    accountNumber: typeof pc.accountNumber === 'string' ? pc.accountNumber : '',
    defaultBox: {
      weightOz: Number(box.weightOz) || 16,
      length: Number(box.length) || 12,
      width: Number(box.width) || 10,
      height: Number(box.height) || 3,
    },
    handling: {
      type: handling.type === 'percent' ? 'percent' : 'flat',
      amount: Number(handling.amount) || 0,
    },
  };
}

function UspsCard({ integration, disabled }: { integration: MaskedIntegration; disabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editMode, setEditMode] = useState<IntegrationMode>(integration.mode);
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [keyResult, setKeyResult] = useState<IntegrationActionResult | null>(null);
  const [test, setTest] = useState<IntegrationActionResult | null>(null);

  const [ship, setShip] = useState<UspsShipping>(readUspsShipping(integration.publicConfig));
  const [shipResult, setShipResult] = useState<IntegrationActionResult | null>(null);

  const hints = integration.hints[editMode] ?? {};

  function toggleService(v: string) {
    setShip((s) => ({
      ...s,
      enabledServices: s.enabledServices.includes(v)
        ? s.enabledServices.filter((x) => x !== v)
        : [...s.enabledServices, v],
    }));
  }

  return (
    <AdminSectionCard
      title="USPS"
      description="Address validation + live shipping rates at checkout. Labels and pickup are handled outside the app."
    >
      <div className="flex flex-col gap-8 p-6">
        {/* --- API keys --- */}
        <div className="flex flex-col gap-6">
          <SubHeading>API credentials</SubHeading>
          <TopControls
            provider="usps"
            integration={integration}
            disabled={disabled || pending}
            onChanged={() => router.refresh()}
          />
          <EditModeTabs value={editMode} onChange={(m) => { setEditMode(m); setKeyResult(null); setTest(null); }} />
          <div className="grid gap-4">
            <SecretField
              label="Consumer key"
              placeholder="Consumer key from developer.usps.com"
              hint={hints.consumerKey}
              value={consumerKey}
              onChange={setConsumerKey}
              disabled={disabled || pending}
            />
            <SecretField
              label="Consumer secret"
              placeholder="Consumer secret"
              hint={hints.consumerSecret}
              value={consumerSecret}
              onChange={setConsumerSecret}
              disabled={disabled || pending}
            />
          </div>
          <ActionRow
            disabled={disabled || pending}
            onSave={() =>
              startTransition(async () => {
                setKeyResult(null);
                const res = await saveUspsKeysAction({
                  mode: editMode,
                  consumerKey: consumerKey || undefined,
                  consumerSecret: consumerSecret || undefined,
                });
                setKeyResult(res);
                if (res.ok) {
                  setConsumerKey('');
                  setConsumerSecret('');
                  router.refresh();
                }
              })
            }
            onTest={() =>
              startTransition(async () => {
                setTest(null);
                setTest(await testUspsConnectionAction(editMode));
              })
            }
          />
          <Results result={keyResult} test={test} />
        </div>

        {/* --- Shipping settings --- */}
        <div className="flex flex-col gap-5 border-t border-border-hairline pt-8">
          <SubHeading>Shipping settings</SubHeading>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Ship-from ZIP"
              placeholder="e.g. 07094"
              value={ship.originZip}
              onChange={(v) => setShip((s) => ({ ...s, originZip: v }))}
              disabled={disabled || pending}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-eyebrow uppercase tracking-[0.14em] text-text-secondary">Rate type</span>
              <Segmented
                options={[
                  { value: 'RETAIL', label: 'Retail' },
                  { value: 'COMMERCIAL', label: 'Commercial' },
                ]}
                value={ship.priceType}
                onChange={(v) => setShip((s) => ({ ...s, priceType: v as 'RETAIL' | 'COMMERCIAL' }))}
                disabled={disabled || pending}
              />
            </div>
          </div>

          {ship.priceType === 'COMMERCIAL' && (
            <TextField
              label="USPS account number (for commercial rates)"
              placeholder="Account / CRID"
              value={ship.accountNumber}
              onChange={(v) => setShip((s) => ({ ...s, accountNumber: v }))}
              disabled={disabled || pending}
            />
          )}

          <div className="flex flex-col gap-2">
            <span className="text-eyebrow uppercase tracking-[0.14em] text-text-secondary">Services offered at checkout</span>
            <div className="grid gap-2">
              {USPS_SERVICES.map((svc) => (
                <label
                  key={svc.value}
                  className="flex cursor-pointer items-center justify-between border border-border-hairline px-4 py-3 text-body"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-accent-ember"
                      checked={ship.enabledServices.includes(svc.value)}
                      onChange={() => toggleService(svc.value)}
                      disabled={disabled || pending}
                    />
                    <span className="font-medium text-text-primary">{svc.label}</span>
                  </span>
                  <span className="text-caption text-text-muted">{svc.meta}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-eyebrow uppercase tracking-[0.14em] text-text-secondary">
              Default package (used when a product has no dimensions)
            </span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumField label="Weight (oz)" value={ship.defaultBox.weightOz} onChange={(n) => setShip((s) => ({ ...s, defaultBox: { ...s.defaultBox, weightOz: n } }))} disabled={disabled || pending} />
              <NumField label="Length (in)" value={ship.defaultBox.length} onChange={(n) => setShip((s) => ({ ...s, defaultBox: { ...s.defaultBox, length: n } }))} disabled={disabled || pending} />
              <NumField label="Width (in)" value={ship.defaultBox.width} onChange={(n) => setShip((s) => ({ ...s, defaultBox: { ...s.defaultBox, width: n } }))} disabled={disabled || pending} />
              <NumField label="Height (in)" value={ship.defaultBox.height} onChange={(n) => setShip((s) => ({ ...s, defaultBox: { ...s.defaultBox, height: n } }))} disabled={disabled || pending} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-eyebrow uppercase tracking-[0.14em] text-text-secondary">Handling fee (added to every shipment)</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-caption text-text-muted">Type</span>
                <Segmented
                  options={[
                    { value: 'flat', label: 'Flat $' },
                    { value: 'percent', label: '% of postage' },
                  ]}
                  value={ship.handling.type}
                  onChange={(v) => setShip((s) => ({ ...s, handling: { ...s.handling, type: v as 'flat' | 'percent' } }))}
                  disabled={disabled || pending}
                />
              </div>
              <NumField
                label={ship.handling.type === 'flat' ? 'Amount ($)' : 'Amount (%)'}
                value={ship.handling.amount}
                onChange={(n) => setShip((s) => ({ ...s, handling: { ...s.handling, amount: n } }))}
                disabled={disabled || pending}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={disabled || pending}
              onClick={() =>
                startTransition(async () => {
                  setShipResult(null);
                  const res = await saveUspsShippingAction(ship);
                  setShipResult(res);
                  if (res.ok) router.refresh();
                })
              }
              className="inline-flex h-10 items-center bg-accent-ember px-5 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90 disabled:opacity-40"
            >
              Save shipping settings
            </button>
          </div>
          <Results result={shipResult} test={null} />
        </div>
      </div>
    </AdminSectionCard>
  );
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function TopControls({
  provider,
  integration,
  disabled,
  onChanged,
}: {
  provider: 'stripe' | 'usps';
  integration: MaskedIntegration;
  disabled: boolean;
  onChanged: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const busy = disabled || pending;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <label className="flex cursor-pointer items-center gap-3 text-body text-text-primary">
        <input
          type="checkbox"
          className="h-4 w-4 accent-accent-ember"
          checked={integration.enabled}
          disabled={busy}
          onChange={(e) =>
            startTransition(async () => {
              await setIntegrationEnabledAction(provider, e.target.checked);
              onChanged();
            })
          }
        />
        Enabled
      </label>

      <div className="flex items-center gap-2">
        <span className="text-caption text-text-muted">Active mode</span>
        <Segmented
          options={[
            { value: 'test', label: 'Test' },
            { value: 'live', label: 'Live' },
          ]}
          value={integration.mode}
          disabled={busy}
          onChange={(v) =>
            startTransition(async () => {
              await setIntegrationModeAction(provider, v as IntegrationMode);
              onChanged();
            })
          }
        />
      </div>
    </div>
  );
}

function EditModeTabs({
  value,
  onChange,
}: {
  value: IntegrationMode;
  onChange: (m: IntegrationMode) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-eyebrow uppercase tracking-[0.14em] text-text-secondary">Editing keys for</span>
      <Segmented
        options={[
          { value: 'test', label: 'Test / Sandbox' },
          { value: 'live', label: 'Live' },
        ]}
        value={value}
        onChange={(v) => onChange(v as IntegrationMode)}
      />
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex border border-border-hairline">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`h-9 px-4 text-caption font-medium uppercase tracking-[0.12em] transition-colors duration-fast ease-standard disabled:opacity-40 ${
              active
                ? 'bg-bg-muted text-accent-ember'
                : 'bg-bg-canvas text-text-secondary hover:bg-bg-subtle'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SecretField({
  label,
  placeholder,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-eyebrow uppercase tracking-[0.14em] text-text-secondary">{label}</span>
      <input
        type="password"
        autoComplete="off"
        spellCheck={false}
        placeholder={hint ? `Stored: ${hint} — leave blank to keep` : placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 border border-border-default bg-bg-canvas px-4 text-body text-text-primary outline-none transition-colors duration-fast ease-standard focus:border-accent-ember focus:ring-2 focus:ring-accent-ember/30 disabled:opacity-50"
      />
      {hint && (
        <span className="text-caption text-text-muted">Currently stored: {hint}</span>
      )}
    </label>
  );
}

function TextField({
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-eyebrow uppercase tracking-[0.14em] text-text-secondary">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 border border-border-default bg-bg-canvas px-4 text-body text-text-primary outline-none transition-colors duration-fast ease-standard focus:border-accent-ember focus:ring-2 focus:ring-accent-ember/30 disabled:opacity-50"
      />
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-caption text-text-muted">{label}</span>
      <input
        type="number"
        min={0}
        step="any"
        value={Number.isFinite(value) ? value : 0}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 border border-border-default bg-bg-canvas px-3 text-body text-text-primary nums-tabular outline-none focus:border-accent-ember focus:ring-2 focus:ring-accent-ember/30 disabled:opacity-50"
      />
    </label>
  );
}

function ActionRow({
  disabled,
  onSave,
  onTest,
}: {
  disabled: boolean;
  onSave: () => void;
  onTest: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={onSave}
        className="inline-flex h-10 items-center bg-accent-ember px-5 text-caption font-medium uppercase tracking-[0.12em] text-bg-canvas transition-opacity duration-fast ease-standard hover:opacity-90 disabled:opacity-40"
      >
        Save keys
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onTest}
        className="inline-flex h-10 items-center border border-border-default px-5 text-caption font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-fast ease-standard hover:bg-bg-subtle disabled:opacity-40"
      >
        Test connection
      </button>
    </div>
  );
}

function Results({
  result,
  test,
}: {
  result: IntegrationActionResult | null;
  test: IntegrationActionResult | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      {result && <Pill result={result} />}
      {test && <Pill result={test} prefix="Test:" />}
    </div>
  );
}

function Pill({ result, prefix }: { result: IntegrationActionResult; prefix?: string }): ReactNode {
  const ok = result.ok;
  const msg = result.ok ? result.message ?? 'Saved.' : result.message;
  return (
    <div
      className={`inline-flex items-center gap-2 self-start border px-3 py-2 text-caption ${
        ok
          ? 'border-state-success/40 bg-state-success/5 text-state-success'
          : 'border-state-danger/40 bg-state-danger/5 text-state-danger'
      }`}
    >
      {ok ? <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> : <XCircle className="h-4 w-4" strokeWidth={1.5} />}
      <span>{prefix ? `${prefix} ${msg}` : msg}</span>
    </div>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-body-lg font-medium text-text-primary">{children}</h3>
  );
}
