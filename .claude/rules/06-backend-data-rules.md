# 06 — Backend & Data Rules

## Backend
**Supabase is the default backend.** Use it for everything unless there is a strong reason not to.

- **Postgres** — catalog, customers, orders, content, try-on jobs
- **Auth** — customer and admin accounts
- **Storage** — product imagery and user try-on uploads
- **RLS (Row-Level Security)** — enforced on every table from day one
- **Edge Functions** — for server-side orchestration (Stripe webhooks, try-on jobs, Amazon sync)

## Relational Schema (target shape)
- `categories` — locked tree with parent_id
- `products` — core product, slug, status, seo fields, try_on_enabled
- `product_variants` — size/color combinations, sku, stock, price, sale_price
- `product_images` — ordered gallery, primary flag
- `product_attributes` — fabric, occasion, care, etc.
- `customers` — linked to auth.users
- `addresses` — per customer
- `orders` — totals, status, channel, payment refs
- `order_items` — variant snapshot at purchase time
- `reviews` — per product, moderated
- `wishlists` — per customer
- `content_pages` — CMS-driven editorial pages
- `channel_mappings` — Amazon SKU/ASIN per product (see `07-amazon-integration-rules.md`)
- `tryon_jobs` — request, status, result, audit trail

Design for production scale and clean joins. Avoid premature denormalization.

## Security
- **RLS-first mindset** — every table has policies before it ships
- Customers can only read/write their own data
- Admin role gated by an explicit `admin` claim
- Service-role key used only in server code, never in the client
- Stripe webhooks verified by signature
- Try-on uploads use signed URLs with short TTL

## State Boundaries

### Zustand
Use **only** for cart and ephemeral UI state:
- cart line items
- cart drawer open/close
- mobile menu open/close
- transient UI flags

Do not store server data in Zustand.

### React Query / TanStack Query
Use for **all** server state:
- product lists, PDPs, categories
- customer orders, addresses, wishlist
- admin queries
- try-on job polling

Set sensible cache keys, stale times, and invalidations.

## Component Architecture
- **Server-first.** Default to React Server Components.
- Client components only when interactivity, browser APIs, or local state require them.
- Keep client components small and leaf-shaped.
- Fetch data on the server when possible; hydrate the client with minimal payloads.

## Migrations & Types
- All schema changes go through Supabase migrations
- Generated TypeScript types are checked in and kept current
- Never hand-write types that mirror DB schema
