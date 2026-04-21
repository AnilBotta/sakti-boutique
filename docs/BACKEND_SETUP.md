# Backend Setup — Step 10A Status

Sakti Boutique currently runs in **placeholder mode**: every page renders, every
admin flow is usable, and no Supabase credentials are required. This document
describes the seam Step 10A put in place and what Step 10B needs to do when
real credentials land.

## What is ready now

| Area | Status | Location |
|---|---|---|
| SQL schema (all core entities, RLS enabled) | ✅ written, not applied | `supabase/migrations/0001_init.sql` |
| DB row types | ✅ | `lib/db/types.ts` |
| DB ↔ UI mappers | ✅ | `lib/db/mappers.ts` |
| Supabase client factories (no-credential safe) | ✅ stubs | `lib/supabase/client.ts` |
| Env guard + placeholder warnings | ✅ | `lib/supabase/env.ts` |
| Catalog repository | ✅ with placeholder fallback | `lib/repositories/catalog.ts` |
| Admin products repository | ✅ with placeholder fallback | `lib/repositories/admin-products.ts` |
| Orders / Reviews / Content repo shells | ✅ | `lib/repositories/*.ts` |
| Product editor validation | ✅ | `lib/validation/product.ts` |
| Admin product save/archive action contracts | ✅ placeholder-safe | `lib/actions/admin-products.ts` |
| Admin auth gating seam | ✅ placeholder admin session in dev | `lib/auth/admin.ts` |
| Storage upload seam (signed URL contract) | ✅ typed contracts only | `lib/storage/product-media.ts` |

Every repository branches on `isSupabaseConfigured()`. When false, the
functions return the same placeholder data the UI already uses from
`lib/catalog/products.ts` and `lib/admin/mock-data.ts` — so nothing visible
changes today.

## Env vars (Step 10B)

Drop these into `.env.local` once a Supabase project exists:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only, never public
```

`SUPABASE_SERVICE_ROLE_KEY` is only consumed by server-side paths
(`lib/supabase/client.ts#getAdminSupabase`). It must never be imported from a
`'use client'` file or exposed in a `NEXT_PUBLIC_` var.

## What Step 10B must do

1. **Install runtime deps**
   ```
   npm install @supabase/supabase-js @supabase/ssr
   ```
2. **Apply the migration** to the Supabase project:
   ```
   supabase db push
   ```
   Then generate types and either commit them or reconcile with
   `lib/db/types.ts`:
   ```
   supabase gen types typescript --project-id <id> > lib/db/database.types.ts
   ```
3. **Create the storage bucket** `product-media` (name defined in
   `lib/storage/product-media.ts`) with RLS policies matching the schema's
   admin-only write / public-read model.
4. **Fill in the live branches** marked `// LIVE (Step 10B):` in:
   - `lib/supabase/client.ts`
   - `lib/repositories/catalog.ts`
   - `lib/repositories/admin-products.ts`
   - `lib/repositories/orders.ts`
   - `lib/storage/product-media.ts`
   - `lib/auth/admin.ts`
5. **Add middleware** for admin route protection. A ready-to-paste sketch
   lives at the bottom of `lib/auth/admin.ts`.
6. **Promote `saveProductAction` to a real Server Action** (`'use server'`
   file + `revalidatePath('/admin/products')`).
7. **Tighten RLS policies.** The migration ships with minimal admin
   policies; add per-table admin + service-role policies before exposing
   the admin to real users.
8. **Seed script** to replace `lib/catalog/products.ts` content with real
   `products` / `product_variants` / `product_images` rows.

Nothing in the UI layer should need to change. If a component starts
importing from `lib/catalog/products` or `lib/admin/mock-data` directly
outside the repository files, route it through the repositories instead.

## Placeholder-mode guarantees

- No module at import-time reads `process.env.NEXT_PUBLIC_SUPABASE_URL!`
  (no non-null assertions on env).
- No module imports `@supabase/supabase-js` today (it isn't installed).
- Dev builds log a one-time console hint when a repository falls back to
  placeholder data — prod builds stay silent.
- `getAdminSession()` returns a synthetic admin in dev so `/admin` keeps
  working; in production it returns `null` when credentials are missing
  and `requireAdmin()` throws — failing loud on deploy-time misconfiguration.
