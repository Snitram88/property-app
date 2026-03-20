alter table public.profiles
  add column if not exists seller_verification_status text not null default 'unverified',
  add column if not exists kyc_submitted_at timestamptz,
  add column if not exists kyc_reviewed_at timestamptz,
  add column if not exists kyc_review_notes text;

do $$
begin
  alter table public.profiles
    add constraint profiles_seller_verification_status_check
    check (seller_verification_status in ('unverified', 'pending_kyc', 'verified', 'rejected', 'suspended'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  seller_type text,
  business_name text,
  company_registration_number text,
  government_id_number text,
  contact_address text,
  city text,
  state text,
  notes text,
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_notes text
);

do $$
begin
  alter table public.kyc_submissions
    add constraint kyc_submissions_status_check
    check (status in ('pending', 'approved', 'rejected'));
exception
  when duplicate_object then null;
end $$;

alter table public.properties
  add column if not exists review_notes text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

create index if not exists idx_kyc_submissions_user_id on public.kyc_submissions(user_id);
create index if not exists idx_kyc_submissions_status on public.kyc_submissions(status);
create index if not exists idx_properties_verification_status on public.properties(verification_status);
create index if not exists idx_properties_owner_id_verification_status on public.properties(owner_id, verification_status);

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.current_user_is_admin() to authenticated;

alter table public.kyc_submissions enable row level security;

drop policy if exists "kyc_submissions_select_own_or_admin" on public.kyc_submissions;
create policy "kyc_submissions_select_own_or_admin"
on public.kyc_submissions
for select
to authenticated
using (
  auth.uid() = user_id or public.current_user_is_admin()
);

drop policy if exists "kyc_submissions_insert_own" on public.kyc_submissions;
create policy "kyc_submissions_insert_own"
on public.kyc_submissions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "kyc_submissions_update_own_or_admin" on public.kyc_submissions;
create policy "kyc_submissions_update_own_or_admin"
on public.kyc_submissions
for update
to authenticated
using (auth.uid() = user_id or public.current_user_is_admin())
with check (auth.uid() = user_id or public.current_user_is_admin());

create or replace function public.submit_seller_kyc(
  p_business_name text,
  p_company_registration_number text,
  p_government_id_number text,
  p_contact_address text,
  p_city text,
  p_state text,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_profile public.profiles%rowtype;
  v_submission_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_profile
  from public.profiles
  where id = v_user_id;

  if v_profile.id is null then
    raise exception 'Profile not found';
  end if;

  if v_profile.seller_type is null then
    raise exception 'Complete your seller profile first before submitting KYC.';
  end if;

  insert into public.kyc_submissions (
    user_id,
    seller_type,
    business_name,
    company_registration_number,
    government_id_number,
    contact_address,
    city,
    state,
    notes,
    status,
    submitted_at,
    reviewed_at,
    reviewed_by,
    review_notes
  )
  values (
    v_user_id,
    v_profile.seller_type,
    nullif(trim(coalesce(p_business_name, '')), ''),
    nullif(trim(coalesce(p_company_registration_number, '')), ''),
    nullif(trim(coalesce(p_government_id_number, '')), ''),
    nullif(trim(coalesce(p_contact_address, '')), ''),
    nullif(trim(coalesce(p_city, '')), ''),
    nullif(trim(coalesce(p_state, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    'pending',
    now(),
    null,
    null,
    null
  )
  on conflict (user_id)
  do update set
    seller_type = excluded.seller_type,
    business_name = excluded.business_name,
    company_registration_number = excluded.company_registration_number,
    government_id_number = excluded.government_id_number,
    contact_address = excluded.contact_address,
    city = excluded.city,
    state = excluded.state,
    notes = excluded.notes,
    status = 'pending',
    submitted_at = now(),
    reviewed_at = null,
    reviewed_by = null,
    review_notes = null
  returning id into v_submission_id;

  update public.profiles
  set
    seller_verification_status = 'pending_kyc',
    kyc_submitted_at = now(),
    kyc_reviewed_at = null,
    kyc_review_notes = null,
    updated_at = now()
  where id = v_user_id;

  return v_submission_id;
end;
$$;

grant execute on function public.submit_seller_kyc(text, text, text, text, text, text, text) to authenticated;

create or replace function public.admin_get_kyc_queue()
returns table (
  submission_id uuid,
  user_id uuid,
  full_name text,
  email text,
  phone text,
  seller_type text,
  business_name text,
  company_registration_number text,
  government_id_number text,
  contact_address text,
  city text,
  state text,
  notes text,
  status text,
  submitted_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    ks.id as submission_id,
    ks.user_id,
    p.full_name,
    p.email,
    p.phone,
    ks.seller_type,
    ks.business_name,
    ks.company_registration_number,
    ks.government_id_number,
    ks.contact_address,
    ks.city,
    ks.state,
    ks.notes,
    ks.status,
    ks.submitted_at
  from public.kyc_submissions ks
  join public.profiles p on p.id = ks.user_id
  where public.current_user_is_admin()
    and ks.status = 'pending'
  order by ks.submitted_at asc;
$$;

grant execute on function public.admin_get_kyc_queue() to authenticated;

create or replace function public.admin_review_kyc(
  p_submission_id uuid,
  p_decision text,
  p_review_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission public.kyc_submissions%rowtype;
  v_admin_id uuid;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  v_admin_id := auth.uid();

  select *
  into v_submission
  from public.kyc_submissions
  where id = p_submission_id;

  if v_submission.id is null then
    raise exception 'KYC submission not found';
  end if;

  update public.kyc_submissions
  set
    status = p_decision,
    reviewed_at = now(),
    reviewed_by = v_admin_id,
    review_notes = nullif(trim(coalesce(p_review_notes, '')), '')
  where id = p_submission_id;

  update public.profiles
  set
    seller_verification_status = case when p_decision = 'approved' then 'verified' else 'rejected' end,
    kyc_reviewed_at = now(),
    kyc_review_notes = nullif(trim(coalesce(p_review_notes, '')), ''),
    updated_at = now()
  where id = v_submission.user_id;

  return p_submission_id;
end;
$$;

grant execute on function public.admin_review_kyc(uuid, text, text) to authenticated;

create or replace function public.admin_get_listing_queue()
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
  verification_status text,
  created_at timestamptz
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
    pr.verification_status,
    pr.created_at
  from public.properties pr
  join public.profiles pf on pf.id = pr.owner_id
  where public.current_user_is_admin()
    and pr.is_published = true
    and pr.verification_status = 'pending'
  order by pr.created_at asc;
$$;

grant execute on function public.admin_get_listing_queue() to authenticated;

create or replace function public.admin_review_listing(
  p_property_id uuid,
  p_decision text,
  p_review_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties%rowtype;
  v_admin_id uuid;
  v_owner_status text;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  v_admin_id := auth.uid();

  select *
  into v_property
  from public.properties
  where id = p_property_id;

  if v_property.id is null then
    raise exception 'Property not found';
  end if;

  select seller_verification_status
  into v_owner_status
  from public.profiles
  where id = v_property.owner_id;

  if p_decision = 'approved' and v_owner_status <> 'verified' then
    raise exception 'Seller KYC must be approved before a listing can be approved.';
  end if;

  update public.properties
  set
    verification_status = case when p_decision = 'approved' then 'approved' else 'rejected' end,
    is_published = case when p_decision = 'approved' then true else false end,
    review_notes = nullif(trim(coalesce(p_review_notes, '')), ''),
    reviewed_at = now(),
    reviewed_by = v_admin_id,
    updated_at = now()
  where id = p_property_id;

  return p_property_id;
end;
$$;

grant execute on function public.admin_review_listing(uuid, text, text) to authenticated;
