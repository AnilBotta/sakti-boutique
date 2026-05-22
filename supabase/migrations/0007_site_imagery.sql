-- Storefront editorial imagery — slot-keyed image table.
--
-- Lets admins upload/replace editorial images on the storefront without
-- shipping code changes. Each slot is a stable text key (e.g. 'audience_women')
-- that storefront components read by name. Reusing the `product-media` bucket
-- for storage under a `site/` prefix keeps RLS surface small.

create table if not exists site_imagery (
  slot          text primary key,
  url           text,            -- resolved public URL, cached for read performance
  storage_path  text,            -- key in the product-media bucket
  alt           text,            -- accessibility caption shown by next/image
  updated_at    timestamptz not null default now()
);

alter table site_imagery enable row level security;

-- Public read (storefront is anonymous).
drop policy if exists "anyone can read site_imagery" on site_imagery;
create policy "anyone can read site_imagery"
  on site_imagery for select
  using (true);

-- Only admins (app_metadata.role = 'admin') can write. Mirrors the pattern
-- used by storage policies and the product RPC.
drop policy if exists "admins write site_imagery" on site_imagery;
create policy "admins write site_imagery"
  on site_imagery for all
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  )
  with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- Track updates.
create or replace function _site_imagery_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists site_imagery_touch on site_imagery;
create trigger site_imagery_touch
before update on site_imagery
for each row execute function _site_imagery_touch();
