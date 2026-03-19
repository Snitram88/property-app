import { supabase } from '@/src/lib/supabase/client';

export type PropertySnapshot = {
  id: string;
  title: string;
  location: string;
  price: string;
  badge: string;
  listingType: string;
};

export async function fetchSavedPropertyRefs(userId: string) {
  const { data, error } = await supabase
    .from('saved_properties')
    .select('property_ref')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return new Set((data ?? []).map((item) => item.property_ref));
}

export async function fetchSavedProperties(userId: string) {
  const { data, error } = await supabase
    .from('saved_properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function toggleSavedProperty(userId: string, property: PropertySnapshot) {
  const { data: existing, error: existingError } = await supabase
    .from('saved_properties')
    .select('id')
    .eq('user_id', userId)
    .eq('property_ref', property.id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    const { error } = await supabase.from('saved_properties').delete().eq('id', existing.id);

    if (error) {
      throw error;
    }

    return false;
  }

  const { error } = await supabase.from('saved_properties').insert({
    user_id: userId,
    property_ref: property.id,
    property_title: property.title,
    property_location: property.location,
    property_price: property.price,
    property_badge: property.badge,
    property_listing_type: property.listingType,
  });

  if (error) {
    throw error;
  }

  return true;
}
