import { supabase } from '@/src/lib/supabase/client';

export type InquiryLeadStatus = 'new' | 'contacted' | 'closed';
export type ViewingLeadStatus = 'pending' | 'confirmed' | 'rescheduled' | 'closed';

export async function updateInquiryLeadStatus(id: string, status: InquiryLeadStatus) {
  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function updateViewingLeadStatus(id: string, status: ViewingLeadStatus) {
  const { error } = await supabase
    .from('viewing_requests')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function rescheduleViewingLead(
  id: string,
  preferredDate: string,
  preferredTime: string,
  notes?: string
) {
  const payload: Record<string, any> = {
    preferred_date: preferredDate,
    preferred_time: preferredTime,
    status: 'rescheduled',
  };

  if (notes?.trim()) {
    payload.notes = notes.trim();
  }

  const { error } = await supabase
    .from('viewing_requests')
    .update(payload)
    .eq('id', id);

  if (error) throw error;
}

export async function getViewingLeadById(id: string) {
  const { data, error } = await supabase
    .from('viewing_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
