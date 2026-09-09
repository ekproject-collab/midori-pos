-- =============================================================================
-- Midori POS — Phase 8: Supabase Storage bucket for product images
-- Public bucket (anyone can read the image URL); only the admin uploads.
-- Re-runnable.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produk-images',
  'produk-images',
  true,
  2097152,                                    -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "produk-images public read" on storage.objects;
create policy "produk-images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'produk-images');

drop policy if exists "produk-images admin insert" on storage.objects;
create policy "produk-images admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produk-images');

drop policy if exists "produk-images admin update" on storage.objects;
create policy "produk-images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produk-images')
  with check (bucket_id = 'produk-images');

drop policy if exists "produk-images admin delete" on storage.objects;
create policy "produk-images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produk-images');
