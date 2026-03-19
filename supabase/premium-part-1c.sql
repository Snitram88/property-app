alter table public.viewing_requests
  add column if not exists property_id uuid references public.properties(id) on delete set null,
  add column if not exists seller_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_viewing_requests_property_id on public.viewing_requests(property_id);
create index if not exists idx_viewing_requests_seller_id on public.viewing_requests(seller_id);

drop policy if exists "viewing_requests_select_own" on public.viewing_requests;
create policy "viewing_requests_select_own"
on public.viewing_requests
for select
to authenticated
using (auth.uid() = user_id or auth.uid() = seller_id);

drop policy if exists "viewing_requests_insert_own" on public.viewing_requests;
create policy "viewing_requests_insert_own"
on public.viewing_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "viewing_requests_update_seller" on public.viewing_requests;
create policy "viewing_requests_update_seller"
on public.viewing_requests
for update
to authenticated
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);
