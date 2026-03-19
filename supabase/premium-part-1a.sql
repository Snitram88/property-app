create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists active_mode text not null default 'buyer',
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_step text not null default 'mode';

do $$
begin
  alter table public.profiles
    add constraint profiles_active_mode_check
    check (active_mode in ('buyer', 'seller', 'admin'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.profiles
    add constraint profiles_onboarding_step_check
    check (onboarding_step in ('mode', 'profile', 'done'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('buyer', 'landlord', 'agent', 'admin')),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_roles_insert_own" on public.user_roles;
create policy "user_roles_insert_own"
on public.user_roles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_roles_update_own" on public.user_roles;
create policy "user_roles_update_own"
on public.user_roles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_roles_delete_own" on public.user_roles;
create policy "user_roles_delete_own"
on public.user_roles
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do nothing;

insert into public.user_roles (user_id, role, is_primary)
select
  p.id,
  case
    when p.role = 'landlord' then 'landlord'
    when p.role = 'agent' then 'agent'
    when p.role = 'admin' then 'admin'
    else 'buyer'
  end as role,
  true
from public.profiles p
where p.role is not null
on conflict (user_id, role) do update
set is_primary = excluded.is_primary;

update public.profiles
set
  active_mode = case
    when role = 'admin' then 'admin'
    when role in ('landlord', 'agent') then 'seller'
    else active_mode
  end,
  onboarding_completed = true,
  onboarding_step = 'done'
where role is not null;
