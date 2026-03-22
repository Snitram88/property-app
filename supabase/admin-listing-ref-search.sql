create sequence if not exists public.listing_ref_seq;

create or replace function public.generate_listing_ref()
returns text
language plpgsql
as $$
declare
  next_number bigint;
begin
  next_number := nextval('public.listing_ref_seq');
  return 'LST-' || lpad(next_number::text, 6, '0');
end;
$$;

alter table public.properties
  add column if not exists listing_ref text;

alter table public.properties
  alter column listing_ref set default public.generate_listing_ref();

update public.properties
set listing_ref = public.generate_listing_ref()
where listing_ref is null or trim(listing_ref) = '';

create unique index if not exists idx_properties_listing_ref_unique
  on public.properties(listing_ref);

create or replace function public.admin_search_manageable_listings(
  p_query text default null,
  p_status text default null
)
returns table (
  property_id uuid,
  listing_ref text,
  owner_id uuid,
  owner_name text,
  owner_email text,
  title text,
  location_text text,
  address text,
  listing_type text,
  price numeric,
  verification_status text,
  moderation_status text,
  moderation_reason text,
  moderation_note text,
  removed_from_public boolean,
  is_published boolean,
  created_at timestamptz,
  image_count bigint,
  cover_image_url text
)
language sql
security definer
set search_path = public
stable
as $$
  with base as (
    select
      p.id as property_id,
      p.listing_ref,
      p.owner_id,
      pr.full_name as owner_name,
      pr.email as owner_email,
      p.title,
      p.location_text,
      p.address,
      p.listing_type,
      p.price,
      p.verification_status,
      coalesce(p.moderation_status, 'pending_review') as moderation_status,
      p.moderation_reason,
      p.moderation_note,
      p.removed_from_public,
      p.is_published,
      p.created_at,
      coalesce(img.image_count, 0) as image_count,
      img.cover_image_url
    from public.properties p
    join public.profiles pr on pr.id = p.owner_id
    left join lateral (
      select
        count(*) as image_count,
        max(case when pi.is_cover then pi.image_url end) as cover_image_url
      from public.property_images pi
      where pi.property_id = p.id
    ) img on true
    where public.current_user_is_admin()
  )
  select *
  from base
  where
    (
      p_query is null
      or trim(p_query) = ''
      or listing_ref ilike '%' || trim(p_query) || '%'
      or title ilike '%' || trim(p_query) || '%'
      or coalesce(location_text, '') ilike '%' || trim(p_query) || '%'
      or coalesce(address, '') ilike '%' || trim(p_query) || '%'
      or coalesce(owner_name, '') ilike '%' || trim(p_query) || '%'
      or coalesce(owner_email, '') ilike '%' || trim(p_query) || '%'
    )
    and (
      p_status is null
      or trim(p_status) = ''
      or lower(moderation_status) = lower(trim(p_status))
    )
  order by created_at desc
  limit 100;
$$;

grant execute on function public.admin_search_manageable_listings(text, text) to authenticated;
