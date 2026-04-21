-- =============================================================================
-- Sakti Boutique — initial schema
-- Step 10A foundation. Safe to apply against a fresh Supabase project once
-- credentials arrive. Every table ships with RLS ENABLED and permissive
-- owner/admin policies sketched below — tighten before production.
-- =============================================================================

-- Extensions ----------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Shared enums --------------------------------------------------------------
do $$ begin
  create type audience as enum ('women', 'men', 'kids');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending', 'paid', 'packed', 'shipped',
    'delivered', 'cancelled', 'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending', 'approved', 'rejected', 'hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type amazon_listing_status as enum (
    'draft', 'pending', 'listed', 'error', 'suppressed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type tryon_job_status as enum (
    'queued', 'processing', 'succeeded', 'failed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table if not exists categories (
  id            uuid primary key default uuid_generate_v4(),
  parent_id     uuid references categories(id) on delete cascade,
  audience      audience,                  -- null for subcategories
  slug          text not null,
  label         text not null,
  position      int  not null default 0,
  banner_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (parent_id, slug)
);
create index if not exists categories_audience_idx on categories(audience);
create index if not exists categories_parent_idx   on categories(parent_id);

create table if not exists products (
  id                uuid primary key default uuid_generate_v4(),
  slug              text not null unique,
  name              text not null,
  description       text,
  fabric            text,
  care              text,
  audience          audience not null,
  category_id       uuid references categories(id) on delete set null,
  subcategory_id    uuid references categories(id) on delete set null,
  price             numeric(10,2) not null default 0,
  original_price    numeric(10,2),
  status            product_status not null default 'draft',
  -- Merchandising flags
  featured          boolean not null default false,
  best_seller       boolean not null default false,
  new_arrival       boolean not null default false,
  -- Experiences
  try_on_enabled    boolean not null default false,
  -- Cached rollups (kept in sync via variants trigger or application code)
  total_stock       int  not null default 0,
  in_stock          boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists products_status_idx        on products(status);
create index if not exists products_audience_idx      on products(audience);
create index if not exists products_category_idx      on products(category_id);
create index if not exists products_subcategory_idx   on products(subcategory_id);
create index if not exists products_try_on_idx        on products(try_on_enabled) where try_on_enabled;
create index if not exists products_featured_idx      on products(featured)       where featured;

create table if not exists product_variants (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references products(id) on delete cascade,
  size          text,
  color         text,
  sku           text not null unique,
  stock         int  not null default 0,
  price         numeric(10,2) not null default 0,
  sale_price    numeric(10,2),
  position      int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists product_variants_product_idx on product_variants(product_id);
create index if not exists product_variants_stock_idx   on product_variants(product_id, stock);

create table if not exists product_images (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references products(id) on delete cascade,
  storage_path  text not null,  -- key in the `product-media` bucket
  url           text,           -- resolved public URL (cached)
  alt           text,
  is_cover      boolean not null default false,
  position      int    not null default 0,
  width         int,
  height        int,
  created_at    timestamptz not null default now()
);
create index if not exists product_images_product_idx on product_images(product_id, position);
create unique index if not exists product_images_one_cover
  on product_images(product_id) where is_cover;

create table if not exists product_attributes (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references products(id) on delete cascade,
  key           text not null,             -- e.g. 'fabric', 'occasion', 'care'
  value         text not null,
  position      int  not null default 0,
  unique (product_id, key, value)
);
create index if not exists product_attributes_product_idx on product_attributes(product_id);

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------

create table if not exists customers (
  id            uuid primary key default uuid_generate_v4(),
  auth_user_id  uuid unique,               -- references auth.users(id) at runtime
  email         citext not null unique,
  full_name     text,
  phone         text,
  lifetime_value numeric(12,2) not null default 0,
  order_count   int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists addresses (
  id            uuid primary key default uuid_generate_v4(),
  customer_id   uuid not null references customers(id) on delete cascade,
  label         text,                      -- 'home', 'work', ...
  full_name     text not null,
  line1         text not null,
  line2         text,
  city          text not null,
  region        text,
  postal_code   text not null,
  country       text not null,
  phone         text,
  is_default_shipping boolean not null default false,
  is_default_billing  boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists addresses_customer_idx on addresses(customer_id);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table if not exists orders (
  id            uuid primary key default uuid_generate_v4(),
  number        text not null unique,      -- human-friendly, e.g. 'SB-00012'
  customer_id   uuid references customers(id) on delete set null,
  status        order_status not null default 'pending',
  channel       text not null default 'storefront', -- 'storefront' | 'amazon'
  currency      text not null default 'USD',
  subtotal      numeric(12,2) not null default 0,
  shipping_total numeric(12,2) not null default 0,
  tax_total     numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  grand_total   numeric(12,2) not null default 0,
  shipping_address_id uuid references addresses(id) on delete set null,
  billing_address_id  uuid references addresses(id) on delete set null,
  payment_provider text,                   -- 'stripe' at first
  payment_ref   text,                      -- PaymentIntent id
  placed_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists orders_customer_idx on orders(customer_id);
create index if not exists orders_status_idx   on orders(status);
create index if not exists orders_channel_idx  on orders(channel);

create table if not exists order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid references products(id) on delete set null,
  variant_id    uuid references product_variants(id) on delete set null,
  -- Snapshot fields so orders remain stable if catalog changes
  name_snapshot text not null,
  variant_label_snapshot text,
  sku_snapshot  text not null,
  price_snapshot numeric(10,2) not null,
  quantity      int not null default 1,
  image_url_snapshot text
);
create index if not exists order_items_order_idx on order_items(order_id);

-- ---------------------------------------------------------------------------
-- Reviews & wishlists
-- ---------------------------------------------------------------------------

create table if not exists reviews (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references products(id) on delete cascade,
  customer_id   uuid references customers(id) on delete set null,
  author_name   text not null,
  rating        int not null check (rating between 1 and 5),
  title         text,
  body          text not null,
  status        review_status not null default 'pending',
  submitted_at  timestamptz not null default now(),
  moderated_at  timestamptz
);
create index if not exists reviews_product_idx on reviews(product_id, status);
create index if not exists reviews_status_idx  on reviews(status);

create table if not exists wishlists (
  id            uuid primary key default uuid_generate_v4(),
  customer_id   uuid not null references customers(id) on delete cascade,
  product_id    uuid not null references products(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (customer_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table if not exists content_pages (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,
  title         text not null,
  status        text not null default 'draft',  -- 'draft' | 'published'
  body          jsonb not null default '{}'::jsonb,
  meta_title    text,
  meta_description text,
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Channel mapping (Amazon is the only secondary channel for now)
-- ---------------------------------------------------------------------------

create table if not exists channel_mappings (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references products(id) on delete cascade,
  channel       text not null,             -- 'amazon'
  publish       boolean not null default false,
  external_sku  text,                      -- Amazon SKU
  external_id   text,                      -- ASIN
  listing_status amazon_listing_status not null default 'draft',
  last_sync_at  timestamptz,
  last_sync_error text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (product_id, channel)
);
create index if not exists channel_mappings_status_idx on channel_mappings(listing_status);

-- ---------------------------------------------------------------------------
-- Virtual Try-On jobs
-- ---------------------------------------------------------------------------

create table if not exists tryon_jobs (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid references customers(id) on delete set null,
  product_id      uuid not null references products(id) on delete cascade,
  variant_id      uuid references product_variants(id) on delete set null,
  status          tryon_job_status not null default 'queued',
  provider        text,                    -- never exposed to client UI
  provider_job_id text,
  source_image_path text,                  -- user upload in storage
  result_image_path text,                  -- result in storage
  error_message   text,
  latency_ms      int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists tryon_jobs_product_idx on tryon_jobs(product_id);
create index if not exists tryon_jobs_status_idx  on tryon_jobs(status);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ declare
  t text;
begin
  for t in select unnest(array[
    'categories','products','product_variants','customers',
    'orders','channel_mappings','tryon_jobs'
  ]) loop
    execute format(
      'drop trigger if exists %I_set_updated_at on %I;
       create trigger %I_set_updated_at before update on %I
       for each row execute function set_updated_at();',
      t, t, t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table categories         enable row level security;
alter table products           enable row level security;
alter table product_variants   enable row level security;
alter table product_images     enable row level security;
alter table product_attributes enable row level security;
alter table customers          enable row level security;
alter table addresses          enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table reviews            enable row level security;
alter table wishlists          enable row level security;
alter table content_pages      enable row level security;
alter table channel_mappings   enable row level security;
alter table tryon_jobs         enable row level security;

-- Public read policies for the storefront
create policy "public can read active products"
  on products for select using (status = 'active');
create policy "public can read variants of active products"
  on product_variants for select using (
    exists (select 1 from products p where p.id = product_variants.product_id and p.status = 'active')
  );
create policy "public can read images of active products"
  on product_images for select using (
    exists (select 1 from products p where p.id = product_images.product_id and p.status = 'active')
  );
create policy "public can read attributes of active products"
  on product_attributes for select using (
    exists (select 1 from products p where p.id = product_attributes.product_id and p.status = 'active')
  );
create policy "public can read categories"
  on categories for select using (true);
create policy "public can read approved reviews"
  on reviews for select using (status = 'approved');
create policy "public can read published content"
  on content_pages for select using (status = 'published');

-- Customer-owned data
create policy "customers read own profile"
  on customers for select using (auth_user_id = auth.uid());
create policy "customers update own profile"
  on customers for update using (auth_user_id = auth.uid());
create policy "customers manage own addresses"
  on addresses for all using (
    exists (select 1 from customers c where c.id = addresses.customer_id and c.auth_user_id = auth.uid())
  );
create policy "customers read own orders"
  on orders for select using (
    exists (select 1 from customers c where c.id = orders.customer_id and c.auth_user_id = auth.uid())
  );
create policy "customers read own order items"
  on order_items for select using (
    exists (
      select 1 from orders o
      join customers c on c.id = o.customer_id
      where o.id = order_items.order_id and c.auth_user_id = auth.uid()
    )
  );
create policy "customers manage own wishlist"
  on wishlists for all using (
    exists (select 1 from customers c where c.id = wishlists.customer_id and c.auth_user_id = auth.uid())
  );

-- Admin access is granted via the service role key (bypasses RLS) OR a
-- custom `app_metadata.role = 'admin'` claim. Tighten in a follow-up.
create policy "admins full access on products"
  on products for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');
-- (Repeat the pattern in the real hardening pass; left minimal here to
-- keep the initial migration focused on shape rather than policy sprawl.)
