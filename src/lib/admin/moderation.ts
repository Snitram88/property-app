import { supabase } from '@/src/lib/supabase/client';

export type AdminModerationAction =
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'remove'
  | 'restore';

export type ManageableListing = {
  property_id: string;
  owner_id: string;
  owner_name: string | null;
  owner_email: string | null;
  title: string;
  location_text: string | null;
  address: string | null;
  listing_type: string | null;
  price: number | null;
  verification_status: string | null;
  moderation_status: string | null;
  moderation_reason: string | null;
  moderation_note: string | null;
  removed_from_public: boolean;
  is_published: boolean;
  created_at: string;
  image_count: number;
  cover_image_url: string | null;
};

export async function fetchManageableListings() {
  const { data, error } = await supabase.rpc('admin_get_manageable_listings');

  if (error) throw error;
  return (data ?? []) as ManageableListing[];
}

export async function moderateListing(params: {
  propertyId: string;
  action: AdminModerationAction;
  reason?: string;
  note?: string;
}) {
  const { data, error } = await supabase.rpc('admin_moderate_property', {
    p_property_id: params.propertyId,
    p_action: params.action,
    p_reason: params.reason?.trim() || null,
    p_note: params.note?.trim() || null,
  });

  if (error) throw error;
  return data;
}
