import { supabase } from '@/src/lib/supabase/client';

export type ConversationItem = {
  id: string;
  property_id: string;
  inquiry_id: string | null;
  buyer_id: string;
  seller_id: string;
  status: 'active' | 'closed';
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  property_title: string;
  property_location: string;
  counterpart_name: string;
  counterpart_role: 'buyer' | 'seller';
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_role: 'buyer' | 'seller' | 'agent' | 'admin' | 'bot';
  body: string;
  created_at: string;
};

export async function startPropertyConversation(input: {
  propertyId: string;
  landlordId: string;
  senderName: string;
  senderEmail: string | null;
  senderPhone: string;
  message: string;
  preferredContact: 'phone' | 'whatsapp' | 'email';
}) {
  const { data, error } = await supabase.rpc('start_property_conversation', {
    p_property_id: input.propertyId,
    p_landlord_id: input.landlordId,
    p_sender_name: input.senderName,
    p_sender_email: input.senderEmail,
    p_sender_phone: input.senderPhone,
    p_message: input.message,
    p_preferred_contact: input.preferredContact,
  });

  if (error) throw error;

  return data as string;
}

export async function fetchUserConversations(userId: string) {
  const { data: conversationRows, error: conversationError } = await supabase
    .from('conversations')
    .select('*')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (conversationError) throw conversationError;

  const rows = conversationRows ?? [];
  const propertyIds = Array.from(new Set(rows.map((item) => item.property_id)));
  const profileIds = Array.from(
    new Set(
      rows.flatMap((item) => [item.buyer_id, item.seller_id]).filter((id) => id !== userId)
    )
  );

  let propertyMap = new Map<string, { title: string; location_text: string }>();
  let profileMap = new Map<string, { full_name: string | null }>();

  if (propertyIds.length) {
    const { data: propertyRows, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, location_text')
      .in('id', propertyIds);

    if (propertyError) throw propertyError;

    propertyMap = new Map(
      (propertyRows ?? []).map((item) => [
        item.id,
        { title: item.title, location_text: item.location_text },
      ])
    );
  }

  if (profileIds.length) {
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', profileIds);

    if (profileError) throw profileError;

    profileMap = new Map(
      (profileRows ?? []).map((item) => [
        item.id,
        { full_name: item.full_name },
      ])
    );
  }

  return rows.map((item) => {
    const counterpartId = item.buyer_id === userId ? item.seller_id : item.buyer_id;
    const counterpartRole = item.buyer_id === userId ? 'seller' : 'buyer';

    return {
      ...item,
      property_title: propertyMap.get(item.property_id)?.title ?? 'Property',
      property_location: propertyMap.get(item.property_id)?.location_text ?? 'Location unavailable',
      counterpart_name: profileMap.get(counterpartId)?.full_name ?? 'Conversation',
      counterpart_role: counterpartRole,
    };
  }) as ConversationItem[];
}

export async function fetchConversationById(conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function fetchConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []) as ChatMessage[];
}

export async function sendConversationMessage(input: {
  conversationId: string;
  senderUserId: string;
  senderRole: 'buyer' | 'seller' | 'agent' | 'admin';
  body: string;
}) {
  const cleanBody = input.body.trim();
  if (!cleanBody) {
    throw new Error('Message body is required.');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_user_id: input.senderUserId,
      sender_role: input.senderRole,
      body: cleanBody,
    })
    .select('*')
    .single();

  if (error) throw error;

  const { error: conversationError } = await supabase
    .from('conversations')
    .update({
      last_message_text: cleanBody,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.conversationId);

  if (conversationError) throw conversationError;

  return data as ChatMessage;
}

export function subscribeToConversationMessages(
  conversationId: string,
  onChange: () => void
) {
  const channel = supabase
    .channel(`conversation-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
