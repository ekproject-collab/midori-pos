-- =============================================================================
-- Midori POS — catalog seed (Midori | 茶 — Matcha & More)
-- Re-runnable: wipes catalog AND orders first, then reinserts the full menu.
-- Menu source: Midori official posters (Matcha / Coffee / Es Series / Snack).
-- =============================================================================

truncate table public.pesanan restart identity cascade;   -- also clears detail_pesanan
delete from public.produk;
delete from public.kategori;
alter sequence public.produk_id_produk_seq restart;
alter sequence public.kategori_id_kategori_seq restart;

insert into public.kategori (nama_kategori) values
  ('Matcha Series'),
  ('Coffee Series'),
  ('Es Series'),
  ('Snack');

insert into public.produk (id_kategori, nama_produk, deskripsi, harga, is_available)
select k.id_kategori, p.nama_produk, p.deskripsi, p.harga, true
from (values
  -- Matcha Series --------------------------------------------------------------
  ('Matcha Series', 'Midori Signature',                 'Matcha latte signature dengan susu segar',        18000),
  ('Matcha Series', 'Midori Ubi Ungu With Whipcream',   'Matcha latte ubi ungu dengan topping whipcream',  22000),
  ('Matcha Series', 'Midori Ubi Ungu No Whipcream',     'Matcha latte ubi ungu tanpa whipcream',           20000),
  ('Matcha Series', 'Midori Strawberry With Whipcream', 'Matcha latte strawberry dengan topping whipcream',22000),
  ('Matcha Series', 'Midori Strawberry No Whipcream',   'Matcha latte strawberry tanpa whipcream',          20000),
  ('Matcha Series', 'Midori Sakura',                    'Matcha latte dengan sentuhan sakura',             20000),
  ('Matcha Series', 'Midori Coconut',                   'Matcha latte dengan santan kelapa',               18000),
  -- Coffee Series --------------------------------------------------------------
  ('Coffee Series', 'Midori Kopi Susu Latte',           'Kopi susu latte signature Midori',                18000),
  ('Coffee Series', 'Midori Karamel Latte',             'Latte dengan saus karamel',                       20000),
  ('Coffee Series', 'Midori Butterscotch',              'Latte dengan butterscotch manis gurih',           20000),
  ('Coffee Series', 'Midori Pandan Latte',              'Latte dengan aroma pandan',                       20000),
  ('Coffee Series', 'Midori Ice Americano',             'Espresso dingin dengan air',                      20000),
  ('Coffee Series', 'Midori Hot Americano',             'Espresso panas dengan air',                       15000),
  ('Coffee Series', 'Midori Aren Latte',                'Latte dengan gula aren',                          15000),
  -- Es Series -----------------------------------------------------------------
  ('Es Series',     'Es Kocok Alpukat',                 'Es kocok alpukat segar',                          13000),
  ('Es Series',     'Es Kocok Durian',                  'Es kocok durian legit',                           15000),
  ('Es Series',     'Es Kocok Mangga',                  'Es kocok mangga manis',                           13000),
  ('Es Series',     'Es Kocok Buah Naga',               'Es kocok buah naga',                              12000),
  ('Es Series',     'Es Ubi Ungu',                      'Es ubi ungu creamy',                              10000),
  ('Es Series',     'Es Yakult Strawberry',             'Yakult strawberry dingin menyegarkan',            10000),
  ('Es Series',     'Es Yakult Rose',                   'Yakult rasa rose dingin',                         10000),
  -- Snack -------------------------------------------------------------------
  ('Snack',         'Roti Coklat / Keju',               'Roti panggang isi coklat atau keju',              5000),
  ('Snack',         'Singkong Krispi',                  'Singkong goreng renyah',                          10000),
  ('Snack',         'Pisang Krispi',                    'Pisang goreng crispy',                            10000),
  ('Snack',         'Lumpia Ubi Ungu',                  'Lumpia isi ubi ungu',                             15000),
  ('Snack',         'Mix Platter',                      'Platter camilan campur',                          30000),
  ('Snack',         'Kentang Goreng',                   'Kentang goreng renyah',                           15000)
) as p(kategori, nama_produk, deskripsi, harga)
join public.kategori k on k.nama_kategori = p.kategori;
