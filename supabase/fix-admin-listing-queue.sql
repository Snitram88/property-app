drop function if exists public.admin_get_listing_queue();

create function public.admin_get_listing_queue()
returns table (
  property_id uuid,
  owner_id uuid,
  owner_name text,
  owner_email text,
  owner_phone text,
  owner_verification_status text,
  title text,
  listing_type text,
  property_type text,
  price numeric,
  location_text text,
  description text,
  bedrooms integer,
  bathrooms integer,
  verification_status text,
  is_published boolean,
  created_at timestamptz,
  image_count bigint,
  cover_image_url text,
  image_urls jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select
    pr.id as property_id,
    pr.owner_id,
    pf.full_name as owner_name,
    pf.email as owner_email,
    pf.phone as owner_phone,
    pf.seller_verification_status as owner_verification_status,
    pr.title,
    pr.listing_type,
    pr.property_type,
    pr.price,
    pr.location_text,
    pr.description,
    pr.bedrooms,
    pr.bathrooms,
    pr.verification_status,
    pr.is_published,
    pr.created_at,
    coalesce(img.image_count, 0) as image_count,
    img.cover_image_url,
    coalesce(img.image_urls, '[]'::jsonb) as image_urls
  from public.properties pr
  join public.profiles pf on pf.id = pr.owner_id
  left join lateral (
    select
      count(*) as image_count,
      max(case when pi.is_cover then pi.image_url end) as cover_image_url,
      jsonb_agg(pi.image_url order by pi.is_cover desc, pi.sort_order asc) as image_urls
    from public.property_images pi
    where pi.property_id = pr.id
  ) img on true
  where public.current_user_is_admin()
    and pr.verification_status = 'pending'
  order by pr.created_at asc;
$$;

grant execute on function public.admin_get_listing_queue() to authenticated;
