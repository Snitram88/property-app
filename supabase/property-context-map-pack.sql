alter table if exists public.inquiries
  add column if not exists property_title_snapshot text,
  add column if not exists property_location_snapshot text,
  add column if not exists property_address_snapshot text,
  add column if not exists property_listing_type_snapshot text,
  add column if not exists property_price_snapshot numeric,
  add column if not exists property_cover_image_snapshot text,
  add column if not exists property_latitude_snapshot numeric,
  add column if not exists property_longitude_snapshot numeric;

alter table if exists public.viewing_requests
  add column if not exists property_title_snapshot text,
  add column if not exists property_location_snapshot text,
  add column if not exists property_address_snapshot text,
  add column if not exists property_listing_type_snapshot text,
  add column if not exists property_price_snapshot numeric,
  add column if not exists property_cover_image_snapshot text,
  add column if not exists property_latitude_snapshot numeric,
  add column if not exists property_longitude_snapshot numeric;

with cover_images as (
  select distinct on (property_id)
    property_id,
    image_url
  from public.property_images
  order by property_id, is_cover desc, sort_order asc, created_at asc
)
update public.inquiries i
set
  property_title_snapshot = coalesce(i.property_title_snapshot, p.title),
  property_location_snapshot = coalesce(i.property_location_snapshot, p.location_text),
  property_address_snapshot = coalesce(i.property_address_snapshot, p.address),
  property_listing_type_snapshot = coalesce(i.property_listing_type_snapshot, p.listing_type),
  property_price_snapshot = coalesce(i.property_price_snapshot, p.price),
  property_cover_image_snapshot = coalesce(i.property_cover_image_snapshot, ci.image_url),
  property_latitude_snapshot = coalesce(i.property_latitude_snapshot, p.latitude),
  property_longitude_snapshot = coalesce(i.property_longitude_snapshot, p.longitude)
from public.properties p
left join cover_images ci on ci.property_id = p.id
where i.property_id = p.id;

with cover_images as (
  select distinct on (property_id)
    property_id,
    image_url
  from public.property_images
  order by property_id, is_cover desc, sort_order asc, created_at asc
)
update public.viewing_requests vr
set
  property_title_snapshot = coalesce(vr.property_title_snapshot, p.title),
  property_location_snapshot = coalesce(vr.property_location_snapshot, p.location_text),
  property_address_snapshot = coalesce(vr.property_address_snapshot, p.address),
  property_listing_type_snapshot = coalesce(vr.property_listing_type_snapshot, p.listing_type),
  property_price_snapshot = coalesce(vr.property_price_snapshot, p.price),
  property_cover_image_snapshot = coalesce(vr.property_cover_image_snapshot, ci.image_url),
  property_latitude_snapshot = coalesce(vr.property_latitude_snapshot, p.latitude),
  property_longitude_snapshot = coalesce(vr.property_longitude_snapshot, p.longitude)
from public.properties p
left join cover_images ci on ci.property_id = p.id
where vr.property_ref = p.id::text;
