create or replace function public.start_viewing_request(
  p_property_id uuid,
  p_phone text,
  p_preferred_date date,
  p_preferred_time text,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_property public.properties%rowtype;
  v_request_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_property
  from public.properties
  where id = p_property_id;

  if v_property.id is null then
    raise exception 'Property not found';
  end if;

  if v_user_id = v_property.owner_id then
    raise exception 'You cannot schedule a viewing for your own listing.';
  end if;

  if not (v_property.is_published = true and v_property.verification_status = 'approved') then
    raise exception 'Viewing is only available for live approved listings.';
  end if;

  insert into public.viewing_requests (
    user_id,
    seller_id,
    property_id,
    property_ref,
    property_title,
    preferred_date,
    preferred_time,
    phone,
    notes,
    status
  )
  values (
    v_user_id,
    v_property.owner_id,
    v_property.id,
    v_property.id::text,
    v_property.title,
    p_preferred_date,
    p_preferred_time,
    p_phone,
    nullif(trim(coalesce(p_notes, '')), ''),
    'pending'
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

grant execute on function public.start_viewing_request(uuid, text, date, text, text) to authenticated;
