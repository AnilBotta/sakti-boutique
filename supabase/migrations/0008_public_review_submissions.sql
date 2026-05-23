-- Public review submissions.
--
-- The storefront PDP now exposes a "Write a review" form. To accept those
-- inserts without the service-role key (the form runs through a server
-- action with the anon client), we need an explicit INSERT policy.
--
-- Hard constraints baked into the policy:
--   * status must be 'pending' on insert — customers cannot self-approve.
--   * moderated_at must be null on insert — set only when an admin acts.
--   * customer_id must be null OR equal to auth.uid() — anon submissions
--     don't carry a customer, logged-in customers can claim their own.
--
-- Public reads remain limited to `status = 'approved'` (policy from 0001).
-- Admins keep full access (policy from 0001/0002).

drop policy if exists "public can submit pending reviews" on reviews;
create policy "public can submit pending reviews"
  on reviews for insert
  with check (
    status = 'pending'
    and moderated_at is null
    and (
      customer_id is null
      or customer_id = auth.uid()
    )
  );
