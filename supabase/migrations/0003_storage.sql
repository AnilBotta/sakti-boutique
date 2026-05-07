-- product-media bucket + RLS policies on storage.objects
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public can read product-media" on storage.objects;
create policy "public can read product-media"
  on storage.objects for select
  using (bucket_id = 'product-media');

drop policy if exists "admins write product-media" on storage.objects;
create policy "admins write product-media"
  on storage.objects for insert
  with check (
    bucket_id = 'product-media'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

drop policy if exists "admins update product-media" on storage.objects;
create policy "admins update product-media"
  on storage.objects for update
  using (
    bucket_id = 'product-media'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  )
  with check (
    bucket_id = 'product-media'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

drop policy if exists "admins delete product-media" on storage.objects;
create policy "admins delete product-media"
  on storage.objects for delete
  using (
    bucket_id = 'product-media'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );
