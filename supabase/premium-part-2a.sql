alter table public.inquiries
  add column if not exists conversation_id uuid;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  inquiry_id uuid unique references public.inquiries(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'closed')),
  last_message_text text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('buyer', 'seller', 'agent', 'admin', 'bot')),
  created_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'seller', 'agent', 'admin', 'bot')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversations_buyer_id on public.conversations(buyer_id);
create index if not exists idx_conversations_seller_id on public.conversations(seller_id);
create index if not exists idx_conversations_property_id on public.conversations(property_id);
create index if not exists idx_conversation_participants_user_id on public.conversation_participants(user_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
on public.conversations
for select
to authenticated
using (
  auth.uid() = buyer_id or auth.uid() = seller_id
);

drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant"
on public.conversations
for insert
to authenticated
with check (
  auth.uid() = buyer_id or auth.uid() = seller_id
);

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
on public.conversations
for update
to authenticated
using (
  auth.uid() = buyer_id or auth.uid() = seller_id
)
with check (
  auth.uid() = buyer_id or auth.uid() = seller_id
);

drop policy if exists "conversation_participants_select_own" on public.conversation_participants;
create policy "conversation_participants_select_own"
on public.conversation_participants
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "conversation_participants_insert_own" on public.conversation_participants;
create policy "conversation_participants_insert_own"
on public.conversation_participants
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "messages_select_if_participant" on public.messages;
create policy "messages_select_if_participant"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "messages_insert_if_sender_participant" on public.messages;
create policy "messages_insert_if_sender_participant"
on public.messages
for insert
to authenticated
with check (
  auth.uid() = sender_user_id
  and exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

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
  v_composed_message text;
begin
  v_buyer_id := auth.uid();

  if v_buyer_id is null then
    raise exception 'Authentication required';
  end if;

  select owner_id into v_property_owner
  from public.properties
  where id = p_property_id;

  if v_property_owner is null then
    raise exception 'Property not found';
  end if;

  if v_property_owner <> p_landlord_id then
    raise exception 'Property owner mismatch';
  end if;

  v_composed_message := trim(coalesce(p_message, '')) || E'\n\nPreferred contact: ' || coalesce(p_preferred_contact, 'phone');

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
    (v_conversation_id, p_landlord_id, 'seller');

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
