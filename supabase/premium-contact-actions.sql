create or replace function public.get_property_contact_details(p_property_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties%rowtype;
  v_profile public.profiles%rowtype;
  v_is_owner boolean := false;
begin
  select *
  into v_property
  from public.properties
  where id = p_property_id;

  if v_property.id is null then
    raise exception 'Property not found';
  end if;

  if auth.uid() is not null and auth.uid() = v_property.owner_id then
    v_is_owner := true;
  end if;

  if not v_is_owner and not (v_property.is_published = true and v_property.verification_status = 'approved') then
    raise exception 'Contact details unavailable for this listing';
  end if;

  select *
  into v_profile
  from public.profiles
  where id = v_property.owner_id;

  return jsonb_build_object(
    'seller_name', v_profile.full_name,
    'seller_phone', v_profile.phone,
    'seller_whatsapp', v_profile.whatsapp_number,
    'seller_email', v_profile.email,
    'is_owner', v_is_owner
  );
end;
$$;

grant execute on function public.get_property_contact_details(uuid) to authenticated, anon;

create or replace function public.start_property_conversation(
  p_property_id uuid,
  p_landlord_id uuid,
  p_sender_name text,
  p_sender_email text,
  p_sender_phone text,
  p_message text,
  p_preferred_contact text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer_id uuid;
  v_property_owner uuid;
  v_inquiry_id uuid;
  v_conversation_id uuid;
  v_existing_conversation uuid;
  v_composed_message text;
begin
  v_buyer_id := auth.uid();

  if v_buyer_id is null then
    raise exception 'Authentication required';
  end if;

  select owner_id
  into v_property_owner
  from public.properties
  where id = p_property_id;

  if v_property_owner is null then
    raise exception 'Property not found';
  end if;

  if v_property_owner <> p_landlord_id then
    raise exception 'Property owner mismatch';
  end if;

  if v_buyer_id = p_landlord_id then
    raise exception 'You cannot message your own listing. Use Seller Preview or Edit Listing instead.';
  end if;

  v_composed_message := trim(coalesce(p_message, '')) || E'\n\nPreferred contact: ' || coalesce(p_preferred_contact, 'in_app');

  select id
  into v_existing_conversation
  from public.conversations
  where property_id = p_property_id
    and buyer_id = v_buyer_id
    and seller_id = p_landlord_id
    and status = 'active'
  order by created_at desc
  limit 1;

  if v_existing_conversation is not null then
    insert into public.conversation_participants (conversation_id, user_id, role)
    values
      (v_existing_conversation, v_buyer_id, 'buyer'),
      (v_existing_conversation, p_landlord_id, 'seller')
    on conflict (conversation_id, user_id) do nothing;

    insert into public.messages (
      conversation_id,
      sender_user_id,
      sender_role,
      body
    )
    values (
      v_existing_conversation,
      v_buyer_id,
      'buyer',
      trim(coalesce(p_message, ''))
    );

    update public.conversations
    set
      last_message_text = trim(coalesce(p_message, '')),
      last_message_at = now(),
      updated_at = now()
    where id = v_existing_conversation;

    return v_existing_conversation;
  end if;

  insert into public.inquiries (
    property_id,
    landlord_id,
    sender_name,
    sender_email,
    sender_phone,
    message,
    status
  )
  values (
    p_property_id,
    p_landlord_id,
    p_sender_name,
    p_sender_email,
    p_sender_phone,
    v_composed_message,
    'new'
  )
  returning id into v_inquiry_id;

  insert into public.conversations (
    property_id,
    inquiry_id,
    buyer_id,
    seller_id,
    status,
    last_message_text,
    last_message_at
  )
  values (
    p_property_id,
    v_inquiry_id,
    v_buyer_id,
    p_landlord_id,
    'active',
    trim(coalesce(p_message, '')),
    now()
  )
  returning id into v_conversation_id;

  insert into public.conversation_participants (conversation_id, user_id, role)
  values
    (v_conversation_id, v_buyer_id, 'buyer'),
    (v_conversation_id, p_landlord_id, 'seller')
  on conflict (conversation_id, user_id) do nothing;

  insert into public.messages (
    conversation_id,
    sender_user_id,
    sender_role,
    body
  )
  values (
    v_conversation_id,
    v_buyer_id,
    'buyer',
    trim(coalesce(p_message, ''))
  );

  update public.inquiries
  set conversation_id = v_conversation_id
  where id = v_inquiry_id;

  return v_conversation_id;
end;
$$;

grant execute on function public.start_property_conversation(uuid, uuid, text, text, text, text, text) to authenticated;

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
