-- Seed: locked category tree + placeholder products from lib/catalog/products.ts.
-- Idempotent via deterministic UUIDs (uuid_generate_v5) and on-conflict guards.
-- Combines what was applied as 0005_seed_categories, 0006_seed_products_v2,
-- 0007_seed_variants, and 0008_seed_images.

-- 1) Categories ---------------------------------------------------------------
do $$
declare
  v_ns uuid := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  v_women uuid := uuid_generate_v5(v_ns, 'sakti:cat:women');
  v_men   uuid := uuid_generate_v5(v_ns, 'sakti:cat:men');
  v_kids  uuid := uuid_generate_v5(v_ns, 'sakti:cat:kids');
  v_w_kurthis uuid := uuid_generate_v5(v_ns, 'sakti:cat:women:kurthis');
  v_w_salwar  uuid := uuid_generate_v5(v_ns, 'sakti:cat:women:salwar-suit');
  v_w_sarees  uuid := uuid_generate_v5(v_ns, 'sakti:cat:women:sarees');
  v_w_lehenga uuid := uuid_generate_v5(v_ns, 'sakti:cat:women:lehenga');
  v_w_blouse  uuid := uuid_generate_v5(v_ns, 'sakti:cat:women:readymade-blouse');
  v_m_kurtha  uuid := uuid_generate_v5(v_ns, 'sakti:cat:men:kurtha');
  v_m_kp      uuid := uuid_generate_v5(v_ns, 'sakti:cat:men:kurtha-pyjama');
  v_m_shirts  uuid := uuid_generate_v5(v_ns, 'sakti:cat:men:shirts');
  v_m_dhoti   uuid := uuid_generate_v5(v_ns, 'sakti:cat:men:dhoti');
  v_k_kurthis uuid := uuid_generate_v5(v_ns, 'sakti:cat:kids:kurthis');
  v_k_salwar  uuid := uuid_generate_v5(v_ns, 'sakti:cat:kids:salwar-suit');
begin
  insert into categories (id, parent_id, audience, slug, label, position) values
    (v_women, null, 'women', 'women', 'Women', 0),
    (v_men,   null, 'men',   'men',   'Men',   1),
    (v_kids,  null, 'kids',  'kids',  'Kids',  2)
  on conflict (id) do nothing;

  insert into categories (id, parent_id, audience, slug, label, position) values
    (v_w_kurthis, v_women, 'women', 'kurthis',          'Kurthis',          0),
    (v_w_salwar,  v_women, 'women', 'salwar-suit',      'Salwar Suit',      1),
    (v_w_sarees,  v_women, 'women', 'sarees',           'Sarees',           2),
    (v_w_lehenga, v_women, 'women', 'lehenga',          'Lehenga',          3),
    (v_w_blouse,  v_women, 'women', 'readymade-blouse', 'Readymade Blouse', 4)
  on conflict (parent_id, slug) do nothing;

  insert into categories (id, parent_id, audience, slug, label, position) values
    (uuid_generate_v5(v_ns, 'sakti:cat:women:kurthis:kurthi-pant-dupatta'),
       v_w_kurthis, 'women', 'kurthi-pant-dupatta', 'Kurthi / Pant / Dupatta', 0),
    (uuid_generate_v5(v_ns, 'sakti:cat:women:kurthis:top-with-dupatta'),
       v_w_kurthis, 'women', 'top-with-dupatta',   'Only Top with Dupatta',   1),
    (uuid_generate_v5(v_ns, 'sakti:cat:women:kurthis:only-kurthi'),
       v_w_kurthis, 'women', 'only-kurthi',        'Only Kurthi',             2),
    (uuid_generate_v5(v_ns, 'sakti:cat:women:sarees:stitched-blouse'),
       v_w_sarees, 'women', 'stitched-blouse',    'Sarees with Stitched Blouse',   0),
    (uuid_generate_v5(v_ns, 'sakti:cat:women:sarees:unstitched-blouse'),
       v_w_sarees, 'women', 'unstitched-blouse',  'Sarees with Unstitched Blouse', 1)
  on conflict (parent_id, slug) do nothing;

  insert into categories (id, parent_id, audience, slug, label, position) values
    (v_m_kurtha, v_men, 'men', 'kurtha',         'Kurtha',          0),
    (v_m_kp,     v_men, 'men', 'kurtha-pyjama',  'Kurtha / Pyjama', 1),
    (v_m_shirts, v_men, 'men', 'shirts',         'Shirts',          2),
    (v_m_dhoti,  v_men, 'men', 'dhoti',          'Dhoti',           3)
  on conflict (parent_id, slug) do nothing;

  insert into categories (id, parent_id, audience, slug, label, position) values
    (v_k_kurthis, v_kids, 'kids', 'kurthis',     'Kurthis',     0),
    (v_k_salwar,  v_kids, 'kids', 'salwar-suit', 'Salwar Suit', 1)
  on conflict (parent_id, slug) do nothing;

  insert into categories (id, parent_id, audience, slug, label, position) values
    (uuid_generate_v5(v_ns, 'sakti:cat:kids:kurthis:only-kurthi'),
       v_k_kurthis, 'kids', 'only-kurthi', 'Only Kurthi', 0),
    (uuid_generate_v5(v_ns, 'sakti:cat:kids:kurthis:kurthi-set'),
       v_k_kurthis, 'kids', 'kurthi-set',  'Kurthi Set',  1)
  on conflict (parent_id, slug) do nothing;
end $$;

-- 2) Products ----------------------------------------------------------------
with ns as (select '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid as id),
raw (slug, name, audience, cat_slug, subcat_slug, price, original_price, badge, image_url, fabric, sizes, colors, occasions, in_stock, created_at) as (values
  ('aanya-hand-embroidered-kurthi-set','Aanya Hand-Embroidered Kurthi Set','women'::audience,'kurthis','kurthi-pant-dupatta',248::numeric,null::numeric,'New','https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80','Cotton',array['XS','S','M','L'],array['Saffron','Ivory'],array['Festive','Everyday'],true,'2026-03-22'::timestamptz),
  ('sahana-mul-cotton-only-kurthi','Sahana Mul Cotton Kurthi','women','kurthis','only-kurthi',128,null,null,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80','Cotton',array['S','M','L','XL'],array['Ivory','Plum'],array['Everyday'],true,'2026-02-10'),
  ('isha-top-with-dupatta','Isha Block-Print Top with Dupatta','women','kurthis','top-with-dupatta',168,null,'Best Seller','https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=900&q=80','Cotton',array['XS','S','M'],array['Ember','Ivory'],array['Everyday','Festive'],true,'2026-01-18'),
  ('devika-silk-kurthi-set','Devika Silk Kurthi Pant Dupatta','women','kurthis','kurthi-pant-dupatta',312,380,null,'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80','Silk',array['M','L','XL'],array['Magenta','Plum'],array['Festive','Wedding'],true,'2026-03-01'),
  ('mira-anarkali-salwar-suit','Mira Anarkali Salwar Suit','women','salwar-suit',null,286,null,'Festive','https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80','Georgette',array['S','M','L'],array['Crimson','Saffron'],array['Festive','Wedding'],true,'2026-03-12'),
  ('kavya-everyday-salwar','Kavya Everyday Salwar','women','salwar-suit',null,158,null,null,'https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=900&q=80','Cotton',array['XS','S','M','L','XL'],array['Ivory'],array['Everyday'],false,'2025-12-04'),
  ('meera-banarasi-silk-saree','Meera Banarasi Silk Saree','women','sarees','stitched-blouse',412,520,'Best Seller','https://images.unsplash.com/photo-1594387310467-bb8b1ba73e2e?auto=format&fit=crop&w=900&q=80','Banarasi Silk',array['Free Size'],array['Crimson','Saffron'],array['Wedding','Festive'],true,'2026-02-25'),
  ('lalitha-soft-silk-saree','Lalitha Soft Silk Saree','women','sarees','unstitched-blouse',348,null,null,'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=900&q=80','Silk',array['Free Size'],array['Plum','Magenta'],array['Festive'],true,'2026-03-08'),
  ('radhika-organza-saree','Radhika Organza Saree','women','sarees','stitched-blouse',288,null,'New','https://images.unsplash.com/photo-1594387310467-bb8b1ba73e2e?auto=format&fit=crop&w=900&q=80','Organza',array['Free Size'],array['Ivory','Saffron'],array['Festive','Reception'],true,'2026-03-30'),
  ('tara-hand-block-lehenga','Tara Hand-Block Lehenga','women','lehenga',null,624,null,'New','https://images.unsplash.com/photo-1610189019926-f8a4ec1cc7e3?auto=format&fit=crop&w=900&q=80','Silk',array['S','M','L'],array['Saffron','Plum'],array['Wedding'],true,'2026-03-26'),
  ('ananya-bridal-lehenga','Ananya Bridal Lehenga','women','lehenga',null,1240,null,null,'https://images.unsplash.com/photo-1610189019926-f8a4ec1cc7e3?auto=format&fit=crop&w=900&q=80','Silk',array['S','M'],array['Crimson'],array['Wedding'],true,'2026-01-30'),
  ('priya-embroidered-blouse','Priya Embroidered Blouse','women','readymade-blouse',null,92,null,null,'https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=900&q=80','Cotton',array['XS','S','M','L'],array['Ivory','Magenta'],array['Festive','Everyday'],true,'2026-02-18'),
  ('ishaan-cotton-kurtha','Ishaan Cotton Kurtha','men','kurtha',null,128,null,'Best Seller','https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=900&q=80','Cotton',array['S','M','L','XL'],array['Ivory','Saffron'],array['Everyday','Festive'],true,'2026-02-22'),
  ('ishaan-cotton-kurtha-pyjama','Ishaan Cotton Kurtha & Pyjama','men','kurtha-pyjama',null,186,null,'Festive','https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=900&q=80','Cotton',array['M','L','XL'],array['Ivory'],array['Festive','Wedding'],true,'2026-03-04'),
  ('arjun-linen-shirt','Arjun Linen Shirt','men','shirts',null,96,null,null,'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80','Linen',array['S','M','L','XL'],array['Ivory','Plum'],array['Everyday'],true,'2026-01-12'),
  ('rohan-silk-dhoti','Rohan Silk Dhoti','men','dhoti',null,142,null,null,'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80','Silk',array['Free Size'],array['Ivory','Saffron'],array['Festive','Wedding'],true,'2026-02-02'),
  ('little-anaya-kurthi','Little Anaya Kurthi','kids','kurthis','only-kurthi',64,null,'New','https://images.unsplash.com/photo-1503944168849-8bf86875b08e?auto=format&fit=crop&w=900&q=80','Cotton',array['2-3Y','4-5Y','6-7Y'],array['Saffron','Ivory'],array['Everyday','Festive'],true,'2026-03-18'),
  ('little-arya-kurthi-set','Little Arya Kurthi Set','kids','kurthis','kurthi-set',92,null,'Festive','https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80','Cotton',array['2-3Y','4-5Y','6-7Y','8-9Y'],array['Magenta','Plum'],array['Festive'],true,'2026-02-28'),
  ('little-mira-salwar','Little Mira Salwar Suit','kids','salwar-suit',null,84,null,null,'https://images.unsplash.com/photo-1503944168849-8bf86875b08e?auto=format&fit=crop&w=900&q=80','Cotton',array['4-5Y','6-7Y','8-9Y'],array['Ivory','Saffron'],array['Festive','Everyday'],true,'2026-01-22')
),
resolved as (
  select
    uuid_generate_v5((select id from ns), 'sakti:product:' || r.slug) as pid,
    r.*,
    cat.id  as category_id,
    sub.id  as subcategory_id
  from raw r
  left join categories cat
    on cat.audience = r.audience and cat.slug = r.cat_slug and cat.parent_id is not null
       and cat.parent_id in (select id from categories where parent_id is null and audience = r.audience)
  left join categories sub
    on r.subcat_slug is not null and sub.slug = r.subcat_slug and sub.parent_id = cat.id
)
insert into products (
  id, slug, name, audience, category_id, subcategory_id,
  price, original_price, status, featured, best_seller, new_arrival,
  total_stock, in_stock, fabric, created_at, updated_at
)
select
  pid, slug, name, audience, category_id, subcategory_id,
  price, original_price, 'active'::product_status,
  coalesce(badge = 'Festive', false),
  coalesce(badge = 'Best Seller', false),
  coalesce(badge = 'New', false),
  case when in_stock then array_length(sizes,1) * 5 else 0 end,
  in_stock,
  fabric,
  created_at,
  created_at
from resolved
on conflict (slug) do nothing;

-- 3) Variants ----------------------------------------------------------------
with size_data (slug, sizes) as (values
  ('aanya-hand-embroidered-kurthi-set', array['XS','S','M','L']),
  ('sahana-mul-cotton-only-kurthi',     array['S','M','L','XL']),
  ('isha-top-with-dupatta',             array['XS','S','M']),
  ('devika-silk-kurthi-set',            array['M','L','XL']),
  ('mira-anarkali-salwar-suit',         array['S','M','L']),
  ('kavya-everyday-salwar',             array['XS','S','M','L','XL']),
  ('meera-banarasi-silk-saree',         array['Free Size']),
  ('lalitha-soft-silk-saree',           array['Free Size']),
  ('radhika-organza-saree',             array['Free Size']),
  ('tara-hand-block-lehenga',           array['S','M','L']),
  ('ananya-bridal-lehenga',             array['S','M']),
  ('priya-embroidered-blouse',          array['XS','S','M','L']),
  ('ishaan-cotton-kurtha',              array['S','M','L','XL']),
  ('ishaan-cotton-kurtha-pyjama',       array['M','L','XL']),
  ('arjun-linen-shirt',                 array['S','M','L','XL']),
  ('rohan-silk-dhoti',                  array['Free Size']),
  ('little-anaya-kurthi',               array['2-3Y','4-5Y','6-7Y']),
  ('little-arya-kurthi-set',            array['2-3Y','4-5Y','6-7Y','8-9Y']),
  ('little-mira-salwar',                array['4-5Y','6-7Y','8-9Y'])
)
insert into product_variants (product_id, size, sku, stock, price, position)
select
  p.id,
  s.size,
  p.slug || '-' || lower(replace(replace(s.size, ' ', '-'), '/', '-')),
  case when p.in_stock then 5 else 0 end,
  p.price,
  (s.ord - 1)::int
from size_data sd
join products p on p.slug = sd.slug
cross join lateral unnest(sd.sizes) with ordinality as s(size, ord)
on conflict (sku) do nothing;

-- 4) Cover images ------------------------------------------------------------
with image_data (slug, url) as (values
  ('aanya-hand-embroidered-kurthi-set','https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'),
  ('sahana-mul-cotton-only-kurthi',    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80'),
  ('isha-top-with-dupatta',            'https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=900&q=80'),
  ('devika-silk-kurthi-set',           'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'),
  ('mira-anarkali-salwar-suit',        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80'),
  ('kavya-everyday-salwar',            'https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=900&q=80'),
  ('meera-banarasi-silk-saree',        'https://images.unsplash.com/photo-1594387310467-bb8b1ba73e2e?auto=format&fit=crop&w=900&q=80'),
  ('lalitha-soft-silk-saree',          'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=900&q=80'),
  ('radhika-organza-saree',            'https://images.unsplash.com/photo-1594387310467-bb8b1ba73e2e?auto=format&fit=crop&w=900&q=80'),
  ('tara-hand-block-lehenga',          'https://images.unsplash.com/photo-1610189019926-f8a4ec1cc7e3?auto=format&fit=crop&w=900&q=80'),
  ('ananya-bridal-lehenga',            'https://images.unsplash.com/photo-1610189019926-f8a4ec1cc7e3?auto=format&fit=crop&w=900&q=80'),
  ('priya-embroidered-blouse',         'https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=900&q=80'),
  ('ishaan-cotton-kurtha',             'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=900&q=80'),
  ('ishaan-cotton-kurtha-pyjama',      'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=900&q=80'),
  ('arjun-linen-shirt',                'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80'),
  ('rohan-silk-dhoti',                 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80'),
  ('little-anaya-kurthi',              'https://images.unsplash.com/photo-1503944168849-8bf86875b08e?auto=format&fit=crop&w=900&q=80'),
  ('little-arya-kurthi-set',           'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80'),
  ('little-mira-salwar',               'https://images.unsplash.com/photo-1503944168849-8bf86875b08e?auto=format&fit=crop&w=900&q=80')
)
insert into product_images (product_id, storage_path, url, alt, is_cover, position)
select
  p.id,
  'external/' || p.slug || '.jpg',
  i.url,
  p.name,
  true,
  0
from image_data i
join products p on p.slug = i.slug
where not exists (
  select 1 from product_images pi where pi.product_id = p.id and pi.is_cover = true
);

-- 5) Occasion attributes -----------------------------------------------------
with occ_data (slug, occ) as (values
  ('aanya-hand-embroidered-kurthi-set', array['Festive','Everyday']),
  ('sahana-mul-cotton-only-kurthi',     array['Everyday']),
  ('isha-top-with-dupatta',             array['Everyday','Festive']),
  ('devika-silk-kurthi-set',            array['Festive','Wedding']),
  ('mira-anarkali-salwar-suit',         array['Festive','Wedding']),
  ('kavya-everyday-salwar',             array['Everyday']),
  ('meera-banarasi-silk-saree',         array['Wedding','Festive']),
  ('lalitha-soft-silk-saree',           array['Festive']),
  ('radhika-organza-saree',             array['Festive','Reception']),
  ('tara-hand-block-lehenga',           array['Wedding']),
  ('ananya-bridal-lehenga',             array['Wedding']),
  ('priya-embroidered-blouse',          array['Festive','Everyday']),
  ('ishaan-cotton-kurtha',              array['Everyday','Festive']),
  ('ishaan-cotton-kurtha-pyjama',       array['Festive','Wedding']),
  ('arjun-linen-shirt',                 array['Everyday']),
  ('rohan-silk-dhoti',                  array['Festive','Wedding']),
  ('little-anaya-kurthi',               array['Everyday','Festive']),
  ('little-arya-kurthi-set',            array['Festive']),
  ('little-mira-salwar',                array['Festive','Everyday'])
)
insert into product_attributes (product_id, key, value, position)
select p.id, 'occasion', o.value, (o.ord - 1)::int
from occ_data od
join products p on p.slug = od.slug
cross join lateral unnest(od.occ) with ordinality as o(value, ord)
on conflict (product_id, key, value) do nothing;
