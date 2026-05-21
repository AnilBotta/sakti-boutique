-- Seed: locked category tree only.
-- Idempotent via deterministic UUIDs (uuid_generate_v5) and on-conflict guards.
--
-- The placeholder product/variant/image entries that originally lived here
-- have been removed so fresh databases start with an empty catalog. The
-- owner provisions real products via the admin UI.

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
