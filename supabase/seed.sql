-- =============================================================================
-- Midori POS — seed data (DEVELOPMENT ONLY)
-- Re-runnable: wipes catalog AND orders first, then reinserts the demo catalog.
-- Never run this against production data.
-- =============================================================================

truncate table public.pesanan restart identity cascade;   -- also clears detail_pesanan
delete from public.produk;
delete from public.kategori;
alter sequence public.produk_id_produk_seq restart;
alter sequence public.kategori_id_kategori_seq restart;

insert into public.kategori (nama_kategori) values
  ('Matcha'),
  ('Coffee'),
  ('Non-Coffee');

insert into public.produk (id_kategori, nama_produk, deskripsi, harga, is_available)
select k.id_kategori, p.nama_produk, p.deskripsi, p.harga, p.is_available
from (values
  ('Matcha',     'Matcha Latte',           'Matcha premium dengan susu segar',          28000, true),
  ('Matcha',     'Iced Matcha Latte',      'Matcha latte dingin, pas untuk siang hari', 30000, true),
  ('Matcha',     'Matcha Espresso Fusion', 'Perpaduan matcha dan shot espresso',        34000, true),
  ('Matcha',     'Hojicha Latte',          'Teh hijau panggang, aroma smoky lembut',    30000, false),
  ('Coffee',     'Americano',              'Espresso dengan air panas',                 22000, true),
  ('Coffee',     'Cafe Latte',             'Espresso dengan steamed milk',              26000, true),
  ('Coffee',     'Cappuccino',             'Espresso dengan foam tebal',                26000, true),
  ('Coffee',     'Kopi Susu Gula Aren',    'Signature kopi susu dengan gula aren',      25000, true),
  ('Non-Coffee', 'Cokelat Panas',          'Cokelat premium hangat',                    24000, true),
  ('Non-Coffee', 'Lemon Tea',              'Teh dengan perasan lemon segar',            20000, true)
) as p(kategori, nama_produk, deskripsi, harga, is_available)
join public.kategori k on k.nama_kategori = p.kategori;
