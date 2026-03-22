alter table public.properties enable row level security;
alter table public.property_images enable row level security;

drop policy if exists "public_read_published_properties" on public.properties;
create policy "public_read_published_properties"
on public.properties
for select
to anon, authenticated
using (
  is_published = true
  and verification_status = 'approved'
);

drop policy if exists "public_read_images_for_published_properties" on public.property_images;
create policy "public_read_images_for_published_properties"
on public.property_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.is_published = true
      and p.verification_status = 'approved'
  )
);
