-- Integration settings — owner-entered third-party API keys, encrypted at rest.
--
-- The store owner manages their OWN Stripe + USPS accounts from the admin
-- panel (sandbox now, live later) without a redeploy. Because env vars can't
-- rotate from a UI, the rotatable keys live here instead of process.env.
--
-- SECURITY:
--   * `secrets_encrypted` is an AES-256-GCM blob (see lib/crypto/secrets.ts) —
--     never store plaintext keys in it.
--   * RLS is admin-write only and there is NO public/authenticated read policy,
--     so anon/authenticated JWTs cannot read this table at all. The app reads
--     it exclusively through the service-role client (getAdminSupabase), which
--     bypasses RLS. This keeps secrets off every non-privileged path.
--   * `hints` holds only masked last-4 display strings; `public_config` holds
--     non-secret operational settings (USPS origin ZIP, enabled services, etc).

create table if not exists integration_settings (
  provider          text primary key,             -- 'stripe' | 'usps'
  enabled           boolean not null default false,
  mode              text not null default 'test' check (mode in ('test', 'live')),
  secrets_encrypted text,                          -- AES-GCM blob (true secrets only), null until first save
  hints             jsonb not null default '{}'::jsonb,   -- masked last4 per key, per mode (UI display only)
  public_config     jsonb not null default '{}'::jsonb,   -- NON-secret operational values (USPS shipping settings)
  updated_at        timestamptz not null default now(),
  updated_by        text
);

alter table integration_settings enable row level security;

-- Admin-only write. NO public/authenticated read policy: secrets are read
-- solely through the service-role client, which bypasses RLS. Mirrors the
-- admin-write pattern used across the schema (site_imagery, storage, RPCs).
drop policy if exists "admins write integration_settings" on integration_settings;
create policy "admins write integration_settings"
  on integration_settings for all
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  )
  with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- Track updates.
create or replace function _integration_settings_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists integration_settings_touch on integration_settings;
create trigger integration_settings_touch
before update on integration_settings
for each row execute function _integration_settings_touch();

-- Seed empty rows so the admin panel always has both providers to render.
insert into integration_settings (provider) values ('stripe'), ('usps')
on conflict (provider) do nothing;
