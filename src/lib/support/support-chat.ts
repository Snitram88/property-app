import { supabase } from '@/src/lib/supabase/client';

export type SupportConversation = {
  id: string;
  user_id: string;
  status: 'open' | 'waiting_user' | 'waiting_admin' | 'resolved' | 'closed';
  topic: string | null;
  escalated_to_human: boolean;
  bot_enabled: boolean;
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
};

export type SupportMessage = {
  id: string;
  conversation_id: string;
  sender_user_id: string | null;
  sender_role: 'user' | 'bot' | 'admin';
  message_type: 'text' | 'system';
  body: string;
  created_at: string;
};

export type AdminSupportConversation = {
  conversation_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  topic: string | null;
  status: string;
  escalated_to_human: boolean;
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
};

export async function getMySupportConversation() {
  const { data, error } = await supabase
    .from('support_conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as SupportConversation | null) ?? null;
}

export async function startSupportConversation(topic?: string, firstMessage?: string) {
  const { data, error } = await supabase.rpc('start_support_conversation', {
    p_topic: topic ?? null,
    p_first_message: firstMessage ?? null,
  });

  if (error) throw error;
  return data as string;
}

export async function sendSupportMessage(conversationId: string, body: string) {
  const { data, error } = await supabase.rpc('send_support_message', {
    p_conversation_id: conversationId,
    p_body: body,
  });

  if (error) throw error;
  return data as string;
}

export async function getSupportMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SupportMessage[];
}

export async function sendBotReply(conversationId: string, body: string) {
  const { data, error } = await supabase.rpc('support_bot_reply', {
    p_conversation_id: conversationId,
    p_body: body,
  });

  if (error) throw error;
  return data as string;
}

export async function escalateSupportToAdmin(conversationId: string) {
  const { data, error } = await supabase.rpc('escalate_support_to_admin', {
    p_conversation_id: conversationId,
  });

  if (error) throw error;
  return data as string;
}

export async function getAdminSupportConversations() {
  const { data, error } = await supabase.rpc('admin_get_support_conversations');

  if (error) throw error;
  return (data ?? []) as AdminSupportConversation[];
}

export async function adminSendSupportMessage(conversationId: string, body: string) {
  const { data, error } = await supabase.rpc('admin_send_support_message', {
    p_conversation_id: conversationId,
    p_body: body,
  });

  if (error) throw error;
  return data as string;
}
