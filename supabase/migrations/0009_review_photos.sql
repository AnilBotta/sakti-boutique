-- Customer review photos.
--
-- Adds a `photos` column (text[] of public URLs) to the reviews table.
-- The storefront review form lets a customer attach up to 5 images that
-- get uploaded to the product-media bucket under reviews/<uuid>/ via the
-- service-role admin client (the customer is anonymous, so the upload
-- goes through the server action — storage RLS is unchanged).
--
-- Why an array column instead of a child review_photos table:
--   - Photos are read together with the review every time; never join-less.
--   - Always written in one atomic shot at review-create time.
--   - Capped at 5 per review at the server-action layer — no scale concern.
--   - Keeps the read path on the PDP to a single row scan.

alter table reviews
  add column if not exists photos text[] not null default '{}';

-- Keep RLS unchanged. The existing INSERT policy permits any column the
-- inserter sets, and `photos` is just stable data — no role check needed.
-- Public SELECT (status='approved') and admin ALL stay as-is.
