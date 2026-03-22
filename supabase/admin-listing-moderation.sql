alter table public.properties
  add column if not exists moderation_status text,
  add column if not exists moderation_reason text,
  add column if not exists moderation_note text,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null,
  add column if not exists moderated_at timestamptz,
  add column if not exists removed_from_public boolean not null default false;

do $$
begin
  alter table public.properties
    add constraint properties_moderation_status_check
    check (
      moderation_status in (
        'pending_review',
        'approved',
        'rejected',
        'suspended',
        'removed_by_admin'
      )
    );
exception
  when duplicate_object then null;
end $$;

update public.properties
set moderation_status = case
  when moderation_status is not null then moderation_status
  when is_published = true and verification_status = 'approved' then 'approved'
  when verification_status = 'rejected' then 'rejected'
  else 'pending_review'
end;

create table if not exists public.property_moderation_logs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  reason text,
  note text,
  old_moderation_status text,
  new_moderation_status text,
  old_is_published boolean,
  new_is_published boolean,
  created_at timestamptz not null default now()
);

do $$
begin
  alter table public.property_moderation_logs
    add constraint property_moderation_logs_action_check
    check (
      action in ('approve', 'reject', 'suspend', 'remove', 'restore')
    );
exception
  when duplicate_object then null;
end $$;

create index if not exists idx_property_moderation_logs_property_id
  on public.property_moderation_logs(property_id);

create or replace function public.admin_moderate_property(
  p_property_id uuid,
  p_action text,
  p_reason text default null,
  p_note text default null
)
returns public.properties
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties%rowtype;
  v_admin_id uuid;
  v_next_status text;
  v_next_is_published boolean;
  v_next_removed boolean;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  select *
  into v_property
  from public.properties
  where id = p_property_id;

  if v_property.id is null then
    raise exception 'Property not found';
  end if;

  v_admin_id := auth.uid();

  case lower(trim(coalesce(p_action, '')))
    when 'approve' then
      v_next_status := 'approved';
      v_next_is_published := true;
      v_next_removed := false;

    when 'reject' then
      v_next_status := 'rejected';
      v_next_is_published := false;
      v_next_removed := true;

    when 'suspend' then
      v_next_status := 'suspended';
      v_next_is_published := false;
      v_next_removed := true;

    when 'remove' then
      v_next_status := 'removed_by_admin';
      v_next_is_published := false;
      v_next_removed := true;

    when 'restore' then
      v_next_status := 'approved';
      v_next_is_published := true;
      v_next_removed := false;

    else
      raise exception 'Unsupported moderation action';
  end case;

  update public.properties
  set
    moderation_status = v_next_status,
    moderation_reason = nullif(trim(coalesce(p_reason, '')), ''),
    moderation_note = nullif(trim(coalesce(p_note, '')), ''),
    moderated_by = v_admin_id,
    moderated_at = now(),
    removed_from_public = v_next_removed,
    is_published = v_next_is_published,
    verification_status = case
      when v_next_status = 'approved' then 'approved'
      when v_next_status = 'rejected' then 'rejected'
      else verification_status
    end
  where id = p_property_id;

  insert into public.property_moderation_logs (
    property_id,
    admin_id,
    action,
    reason,
    note,
    old_moderation_status,
    new_moderation_status,
    old_is_published,
    new_is_published
  )
  values (
    p_property_id,
    v_admin_id,
    lower(trim(p_action)),
    nullif(trim(coalesce(p_reason, '')), ''),
    nullif(trim(coalesce(p_note, '')), ''),
    v_property.moderation_status,
    v_next_status,
    v_property.is_published,
    v_next_is_published
  );

  return (
    select p
    from public.properties p
    where p.id = p_property_id
  );
end;
$$;

grant execute on function public.admin_moderate_property(uuid, text, text, text) to authenticated;

create or replace function public.admin_get_manageable_listings()
returns table (
  property_id uuid,
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
  select
    p.id as property_id,
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
  order by p.created_at desc;
$$;

grant execute on function public.admin_get_manageable_listings() to authenticated;
