alter table public.properties
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  storage_path text unique,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_property_images_property_id on public.property_images(property_id);
create index if not exists idx_property_images_is_cover on public.property_images(is_cover);

alter table public.property_images enable row level security;

drop policy if exists "property_images_public_read" on public.property_images;
create policy "property_images_public_read"
on public.property_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_id
      and (
        (p.is_published = true and p.verification_status = 'approved')
        or p.owner_id = auth.uid()
      )
  )
);

drop policy if exists "property_images_owner_insert" on public.property_images;
create policy "property_images_owner_insert"
on public.property_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "property_images_owner_update" on public.property_images;
create policy "property_images_owner_update"
on public.property_images
for update
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "property_images_owner_delete" on public.property_images;
create policy "property_images_owner_delete"
on public.property_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.owner_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "property_images_storage_public_read" on storage.objects;
create policy "property_images_storage_public_read"
on storage.objects
for select
to public
using (bucket_id = 'property-images');

drop policy if exists "property_images_storage_auth_insert" on storage.objects;
create policy "property_images_storage_auth_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "property_images_storage_auth_update" on storage.objects;
create policy "property_images_storage_auth_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "property_images_storage_auth_delete" on storage.objects;
create policy "property_images_storage_auth_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
