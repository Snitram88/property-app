create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open',
  channel text not null default 'in_app',
  topic text,
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  escalated_to_human boolean not null default false,
  bot_enabled boolean not null default true,
  last_message_text text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  alter table public.support_conversations
    add constraint support_conversations_status_check
    check (status in ('open', 'waiting_user', 'waiting_admin', 'resolved', 'closed'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_user_id uuid references public.profiles(id) on delete set null,
  sender_role text not null,
  message_type text not null default 'text',
  body text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  alter table public.support_messages
    add constraint support_messages_sender_role_check
    check (sender_role in ('user', 'bot', 'admin'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.support_messages
    add constraint support_messages_message_type_check
    check (message_type in ('text', 'system'));
exception
  when duplicate_object then null;
end $$;

create index if not exists idx_support_conversations_user_id on public.support_conversations(user_id);
create index if not exists idx_support_conversations_status on public.support_conversations(status);
create index if not exists idx_support_messages_conversation_id on public.support_messages(conversation_id);
create index if not exists idx_support_messages_created_at on public.support_messages(created_at);

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "support_conversations_select_user_or_admin" on public.support_conversations;
create policy "support_conversations_select_user_or_admin"
on public.support_conversations
for select
to authenticated
using (
  auth.uid() = user_id or public.current_user_is_admin()
);

drop policy if exists "support_conversations_insert_own" on public.support_conversations;
create policy "support_conversations_insert_own"
on public.support_conversations
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "support_conversations_update_user_or_admin" on public.support_conversations;
create policy "support_conversations_update_user_or_admin"
on public.support_conversations
for update
to authenticated
using (
  auth.uid() = user_id or public.current_user_is_admin()
)
with check (
  auth.uid() = user_id or public.current_user_is_admin()
);

drop policy if exists "support_messages_select_user_or_admin" on public.support_messages;
create policy "support_messages_select_user_or_admin"
on public.support_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_conversations sc
    where sc.id = conversation_id
      and (sc.user_id = auth.uid() or public.current_user_is_admin())
  )
);

drop policy if exists "support_messages_insert_user_or_admin" on public.support_messages;
create policy "support_messages_insert_user_or_admin"
on public.support_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.support_conversations sc
    where sc.id = conversation_id
      and (sc.user_id = auth.uid() or public.current_user_is_admin())
  )
);

create or replace function public.start_support_conversation(
  p_topic text default null,
  p_first_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_conversation_id uuid;
  v_existing_id uuid;
  v_first_message text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select id
  into v_existing_id
  from public.support_conversations
  where user_id = v_user_id
    and status in ('open', 'waiting_user', 'waiting_admin')
  order by updated_at desc
  limit 1;

  if v_existing_id is not null then
    if nullif(trim(coalesce(p_first_message, '')), '') is not null then
      insert into public.support_messages (
        conversation_id,
        sender_user_id,
        sender_role,
        message_type,
        body
      )
      values (
        v_existing_id,
        v_user_id,
        'user',
        'text',
        trim(p_first_message)
      );

      update public.support_conversations
      set
        topic = coalesce(topic, nullif(trim(coalesce(p_topic, '')), '')),
        last_message_text = trim(p_first_message),
        last_message_at = now(),
        status = 'waiting_admin',
        updated_at = now()
      where id = v_existing_id;
    end if;

    return v_existing_id;
  end if;

  v_first_message := nullif(trim(coalesce(p_first_message, '')), '');

  insert into public.support_conversations (
    user_id,
    topic,
    status,
    channel,
    escalated_to_human,
    bot_enabled,
    last_message_text,
    last_message_at
  )
  values (
    v_user_id,
    nullif(trim(coalesce(p_topic, '')), ''),
    case when v_first_message is null then 'open' else 'waiting_admin' end,
    'in_app',
    false,
    true,
    v_first_message,
    case when v_first_message is null then null else now() end
  )
  returning id into v_conversation_id;

  insert into public.support_messages (
    conversation_id,
    sender_user_id,
    sender_role,
    message_type,
    body
  )
  values (
    v_conversation_id,
    null,
    'bot',
    'system',
    'Hello 👋 I’m the support assistant. I can help with account issues, KYC, listings, payments later, or escalate you to a human admin.'
  );

  if v_first_message is not null then
    insert into public.support_messages (
      conversation_id,
      sender_user_id,
      sender_role,
      message_type,
      body
    )
    values (
      v_conversation_id,
      v_user_id,
      'user',
      'text',
      v_first_message
    );
  end if;

  return v_conversation_id;
end;
$$;

grant execute on function public.start_support_conversation(text, text) to authenticated;

create or replace function public.send_support_message(
  p_conversation_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_conversation public.support_conversations%rowtype;
  v_message_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_conversation
  from public.support_conversations
  where id = p_conversation_id
    and user_id = v_user_id;

  if v_conversation.id is null then
    raise exception 'Support conversation not found';
  end if;

  if nullif(trim(coalesce(p_body, '')), '') is null then
    raise exception 'Message cannot be empty';
  end if;

  insert into public.support_messages (
    conversation_id,
    sender_user_id,
    sender_role,
    message_type,
    body
  )
  values (
    p_conversation_id,
    v_user_id,
    'user',
    'text',
    trim(p_body)
  )
  returning id into v_message_id;

  update public.support_conversations
  set
    last_message_text = trim(p_body),
    last_message_at = now(),
    status = case when escalated_to_human then 'waiting_admin' else 'waiting_admin' end,
    updated_at = now()
  where id = p_conversation_id;

  return v_message_id;
end;
$$;

grant execute on function public.send_support_message(uuid, text) to authenticated;

create or replace function public.support_bot_reply(
  p_conversation_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_conversation public.support_conversations%rowtype;
  v_reply text;
  v_message_id uuid;
  v_lower text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_conversation
  from public.support_conversations
  where id = p_conversation_id
    and user_id = v_user_id;

  if v_conversation.id is null then
    raise exception 'Support conversation not found';
  end if;

  if v_conversation.escalated_to_human = true then
    raise exception 'This conversation has already been escalated to a human admin';
  end if;

  v_lower := lower(coalesce(p_body, ''));

  if v_lower like '%kyc%' or v_lower like '%verify%' then
    v_reply := 'For KYC help, open Seller KYC, confirm your address, ID details, and seller type, then resubmit. If you still need help, tap escalate to human admin.';
  elsif v_lower like '%listing%' or v_lower like '%property%' then
    v_reply := 'For listing help, make sure your cover image, gallery, price, location, and description are complete. Rejected listings can be edited and resubmitted for review.';
  elsif v_lower like '%message%' or v_lower like '%chat%' then
    v_reply := 'For messaging help, use in-app contact from a property page. If messages are missing, refresh the thread or reopen the property and continue the same conversation.';
  elsif v_lower like '%viewing%' then
    v_reply := 'For viewing issues, confirm the listing is live and approved, then submit a schedule request again. Sellers cannot book viewings on their own listings.';
  else
    v_reply := 'I can help with KYC, listings, messages, and viewing requests. If you want a human admin, tap escalate to human support.';
  end if;

  insert into public.support_messages (
    conversation_id,
    sender_user_id,
    sender_role,
    message_type,
    body
  )
  values (
    p_conversation_id,
    null,
    'bot',
    'text',
    v_reply
  )
  returning id into v_message_id;

  update public.support_conversations
  set
    last_message_text = v_reply,
    last_message_at = now(),
    status = 'waiting_user',
    updated_at = now()
  where id = p_conversation_id;

  return v_message_id;
end;
$$;

grant execute on function public.support_bot_reply(uuid, text) to authenticated;

create or replace function public.escalate_support_to_admin(
  p_conversation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_conversation public.support_conversations%rowtype;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into v_conversation
  from public.support_conversations
  where id = p_conversation_id
    and user_id = v_user_id;

  if v_conversation.id is null then
    raise exception 'Support conversation not found';
  end if;

  update public.support_conversations
  set
    escalated_to_human = true,
    bot_enabled = false,
    status = 'waiting_admin',
    updated_at = now()
  where id = p_conversation_id;

  insert into public.support_messages (
    conversation_id,
    sender_user_id,
    sender_role,
    message_type,
    body
  )
  values (
    p_conversation_id,
    null,
    'system',
    'system',
    'Conversation escalated to human admin support.'
  );

  return p_conversation_id;
end;
$$;

grant execute on function public.escalate_support_to_admin(uuid) to authenticated;

create or replace function public.admin_get_support_conversations()
returns table (
  conversation_id uuid,
  user_id uuid,
  user_name text,
  user_email text,
  topic text,
  status text,
  escalated_to_human boolean,
  last_message_text text,
  last_message_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    sc.id as conversation_id,
    sc.user_id,
    p.full_name as user_name,
    p.email as user_email,
    sc.topic,
    sc.status,
    sc.escalated_to_human,
    sc.last_message_text,
    sc.last_message_at,
    sc.created_at
  from public.support_conversations sc
  join public.profiles p on p.id = sc.user_id
  where public.current_user_is_admin()
  order by coalesce(sc.last_message_at, sc.created_at) desc;
$$;

grant execute on function public.admin_get_support_conversations() to authenticated;

create or replace function public.admin_send_support_message(
  p_conversation_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_message_id uuid;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  if nullif(trim(coalesce(p_body, '')), '') is null then
    raise exception 'Message cannot be empty';
  end if;

  v_admin_id := auth.uid();

  insert into public.support_messages (
    conversation_id,
    sender_user_id,
    sender_role,
    message_type,
    body
  )
  values (
    p_conversation_id,
    v_admin_id,
    'admin',
    'text',
    trim(p_body)
  )
  returning id into v_message_id;

  update public.support_conversations
  set
    assigned_admin_id = coalesce(assigned_admin_id, v_admin_id),
    last_message_text = trim(p_body),
    last_message_at = now(),
    status = 'waiting_user',
    escalated_to_human = true,
    bot_enabled = false,
    updated_at = now()
  where id = p_conversation_id;

  return v_message_id;
end;
$$;

grant execute on function public.admin_send_support_message(uuid, text) to authenticated;
