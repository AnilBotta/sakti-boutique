-- save_product_full: atomic insert/update of product + variants + images + channel mapping.
-- Payload shape (matches lib/db/mappers.ts ProductWritePayload + slug fields for category resolution):
-- {
--   product: { id?, slug, name, description, fabric, care, audience, category_slug, subcategory_slug,
--              price, original_price, status, featured, best_seller, new_arrival, try_on_enabled },
--   variants: [{ id?, size, color, sku, stock, price, sale_price, position }],
--   images:   [{ id?, storage_path, url, alt, is_cover, position, width, height }],
--   channel:  { publish, external_sku, external_id, listing_status }
-- }
-- Returns { id, slug }.

create or replace function save_product_full(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product       jsonb := payload -> 'product';
  v_variants      jsonb := coalesce(payload -> 'variants', '[]'::jsonb);
  v_images        jsonb := coalesce(payload -> 'images', '[]'::jsonb);
  v_channel       jsonb := payload -> 'channel';
  v_audience      audience := (v_product ->> 'audience')::audience;
  v_cat_slug      text := nullif(v_product ->> 'category_slug', '');
  v_subcat_slug   text := nullif(v_product ->> 'subcategory_slug', '');
  v_category_id   uuid;
  v_subcat_id     uuid;
  v_product_id    uuid;
  v_slug          text := v_product ->> 'slug';
  v_total_stock   int := 0;
  v_in_stock      boolean := false;
begin
  if v_cat_slug is not null then
    select id into v_category_id
      from categories
      where slug = v_cat_slug and parent_id is null and audience = v_audience
      limit 1;
  end if;

  if v_subcat_slug is not null and v_category_id is not null then
    select id into v_subcat_id
      from categories
      where slug = v_subcat_slug and parent_id = v_category_id
      limit 1;
  end if;

  select coalesce(sum( (v ->> 'stock')::int ), 0)
    into v_total_stock
    from jsonb_array_elements(v_variants) v;
  v_in_stock := v_total_stock > 0;

  if (v_product ->> 'id') is not null and (v_product ->> 'id') <> '' then
    v_product_id := (v_product ->> 'id')::uuid;
    update products set
      slug           = v_slug,
      name           = v_product ->> 'name',
      description    = v_product ->> 'description',
      fabric         = v_product ->> 'fabric',
      care           = v_product ->> 'care',
      audience       = v_audience,
      category_id    = v_category_id,
      subcategory_id = v_subcat_id,
      price          = (v_product ->> 'price')::numeric,
      original_price = nullif(v_product ->> 'original_price', '')::numeric,
      status         = (v_product ->> 'status')::product_status,
      featured       = coalesce((v_product ->> 'featured')::boolean, false),
      best_seller    = coalesce((v_product ->> 'best_seller')::boolean, false),
      new_arrival    = coalesce((v_product ->> 'new_arrival')::boolean, false),
      try_on_enabled = coalesce((v_product ->> 'try_on_enabled')::boolean, false),
      total_stock    = v_total_stock,
      in_stock       = v_in_stock,
      updated_at     = now()
      where id = v_product_id;
  else
    insert into products (
      slug, name, description, fabric, care, audience,
      category_id, subcategory_id, price, original_price, status,
      featured, best_seller, new_arrival, try_on_enabled,
      total_stock, in_stock
    ) values (
      v_slug,
      v_product ->> 'name',
      v_product ->> 'description',
      v_product ->> 'fabric',
      v_product ->> 'care',
      v_audience,
      v_category_id,
      v_subcat_id,
      (v_product ->> 'price')::numeric,
      nullif(v_product ->> 'original_price', '')::numeric,
      (v_product ->> 'status')::product_status,
      coalesce((v_product ->> 'featured')::boolean, false),
      coalesce((v_product ->> 'best_seller')::boolean, false),
      coalesce((v_product ->> 'new_arrival')::boolean, false),
      coalesce((v_product ->> 'try_on_enabled')::boolean, false),
      v_total_stock,
      v_in_stock
    )
    returning id into v_product_id;
  end if;

  delete from product_variants where product_id = v_product_id;
  insert into product_variants (product_id, size, color, sku, stock, price, sale_price, position)
  select
    v_product_id,
    nullif(v ->> 'size', ''),
    nullif(v ->> 'color', ''),
    v ->> 'sku',
    coalesce((v ->> 'stock')::int, 0),
    coalesce((v ->> 'price')::numeric, 0),
    nullif(v ->> 'sale_price', '')::numeric,
    coalesce((v ->> 'position')::int, ord)
  from jsonb_array_elements(v_variants) with ordinality as t(v, ord);

  delete from product_images where product_id = v_product_id;
  insert into product_images (product_id, storage_path, url, alt, is_cover, position, width, height)
  select
    v_product_id,
    img ->> 'storage_path',
    nullif(img ->> 'url', ''),
    nullif(img ->> 'alt', ''),
    coalesce((img ->> 'is_cover')::boolean, false),
    coalesce((img ->> 'position')::int, ord),
    nullif(img ->> 'width', '')::int,
    nullif(img ->> 'height', '')::int
  from jsonb_array_elements(v_images) with ordinality as t(img, ord);

  if v_channel is not null then
    insert into channel_mappings (
      product_id, channel, publish, external_sku, external_id, listing_status
    ) values (
      v_product_id, 'amazon',
      coalesce((v_channel ->> 'publish')::boolean, false),
      nullif(v_channel ->> 'external_sku', ''),
      nullif(v_channel ->> 'external_id', ''),
      coalesce((v_channel ->> 'listing_status')::amazon_listing_status, 'draft')
    )
    on conflict (product_id, channel) do update set
      publish        = excluded.publish,
      external_sku   = excluded.external_sku,
      external_id    = excluded.external_id,
      listing_status = excluded.listing_status,
      updated_at     = now();
  end if;

  return jsonb_build_object('id', v_product_id, 'slug', v_slug);
end;
$$;

revoke execute on function save_product_full(jsonb) from public, anon, authenticated;
grant  execute on function save_product_full(jsonb) to service_role;

create or replace function reorder_product_images(p_product_id uuid, p_ids uuid[])
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update product_images pi
     set position = idx.ord - 1
    from unnest(p_ids) with ordinality as idx(id, ord)
   where pi.product_id = p_product_id
     and pi.id = idx.id;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function reorder_product_images(uuid, uuid[]) from public, anon, authenticated;
grant  execute on function reorder_product_images(uuid, uuid[]) to service_role;
