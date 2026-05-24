-- Newsletter subscribers — captures the homepage "Letters from the atelier"
-- form so the operator can export the list and email subscribers later
-- (Mailchimp, SendGrid, Resend, etc.).
--
-- Kept as a separate table from `customers`:
--   - A subscriber may never become a customer (and vice-versa).
--   - Privacy: subscriber rows are admin-only reads (customers table has
--     looser visibility patterns for the account flow).
--   - Cleaner provenance: we track which placement captured the email.
--
-- Email uses citext so 'Anil@Example.com' and 'anil@example.com' dedupe.

create extension if not exists citext;

create table if not exists newsletter_subscribers (
  id              uuid primary key default uuid_generate_v4(),
  email           citext not null,
  source          text not null default 'homepage',
  status          text not null default 'active'
                    check (status in ('active', 'unsubscribed')),
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unique (email)
);

create index if not exists newsletter_subscribers_status_idx
  on newsletter_subscribers (status);

alter table newsletter_subscribers enable row level security;

-- Public can subscribe — but only as 'active', and only set the fields
-- they're allowed to set. Cannot self-unsubscribe via raw inserts.
drop policy if exists "public can subscribe to newsletter" on newsletter_subscribers;
create policy "public can subscribe to newsletter"
  on newsletter_subscribers for insert
  with check (
    status = 'active'
    and unsubscribed_at is null
  );

-- Admins (app_metadata.role = 'admin') have full read + write. No public
-- SELECT — the subscriber list is private.
drop policy if exists "admins full access on newsletter_subscribers"
  on newsletter_subscribers;
create policy "admins full access on newsletter_subscribers"
  on newsletter_subscribers for all
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  )
  with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );
