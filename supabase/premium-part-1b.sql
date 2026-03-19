alter table public.profiles
  add column if not exists seller_type text,
  add column if not exists preferred_locations text,
  add column if not exists budget_min numeric(14,2),
  add column if not exists budget_max numeric(14,2),
  add column if not exists property_interest_type text,
  add column if not exists company_name text,
  add column if not exists notification_preferences jsonb not null default '{}'::jsonb;

do $$
begin
  alter table public.profiles
    add constraint profiles_seller_type_check
    check (seller_type in ('landlord', 'agent') or seller_type is null);
exception
  when duplicate_object then null;
end $$;

create table if not exists public.saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_ref text not null,
  property_title text not null,
  property_location text,
  property_price text,
  property_badge text,
  property_listing_type text,
  created_at timestamptz not null default now(),
  unique (user_id, property_ref)
);

create table if not exists public.viewing_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_ref text not null,
  property_title text not null,
  preferred_date date not null,
  preferred_time text not null,
  phone text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.saved_properties enable row level security;
alter table public.viewing_requests enable row level security;

drop policy if exists "saved_properties_select_own" on public.saved_properties;
create policy "saved_properties_select_own"
on public.saved_properties
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "saved_properties_insert_own" on public.saved_properties;
create policy "saved_properties_insert_own"
on public.saved_properties
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "saved_properties_delete_own" on public.saved_properties;
create policy "saved_properties_delete_own"
on public.saved_properties
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "viewing_requests_select_own" on public.viewing_requests;
create policy "viewing_requests_select_own"
on public.viewing_requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "viewing_requests_insert_own" on public.viewing_requests;
create policy "viewing_requests_insert_own"
on public.viewing_requests
for insert
to authenticated
with check (auth.uid() = user_id);

create index if not exists idx_saved_properties_user_id on public.saved_properties(user_id);
create index if not exists idx_saved_properties_property_ref on public.saved_properties(property_ref);
create index if not exists idx_viewing_requests_user_id on public.viewing_requests(user_id);
create index if not exists idx_viewing_requests_property_ref on public.viewing_requests(property_ref);
