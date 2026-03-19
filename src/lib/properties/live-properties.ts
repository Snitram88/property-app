import { supabase } from '@/src/lib/supabase/client';

export type DatabaseProperty = {
  id: string;
  owner_id: string;
  title: string;
  listing_type: 'rent' | 'lease' | 'sale';
  property_type: string;
  price: number;
  state: string;
  city: string;
  address: string | null;
  location_text: string;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  is_published: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type PropertyFormValues = {
  title: string;
  listingType: 'rent' | 'lease' | 'sale';
  propertyType: string;
  price: string;
  state: string;
  city: string;
  address: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  isPublished: boolean;
};

export type SellerInquiryItem = {
  id: string;
  sender_name: string;
  sender_email: string | null;
  sender_phone: string | null;
  message: string;
  status: string;
  created_at: string;
  property_id: string;
  property_title: string;
  property_location: string;
};

export type SellerViewingItem = {
  id: string;
  property_ref: string;
  property_title: string;
  preferred_date: string;
  preferred_time: string;
  phone: string;
  notes: string | null;
  status: string;
  created_at: string;
};

function toNumber(value: string, fallback = 0) {
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatPrice(price: number | null | undefined) {
  if (price == null) return 'Price on request';

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);
}

export function propertyToSnapshot(property: DatabaseProperty) {
  return {
    id: property.id,
    title: property.title,
    location: property.location_text,
    price:
      property.listing_type === 'sale'
        ? formatPrice(property.price)
        : `${formatPrice(property.price)} / year`,
    badge:
      property.verification_status === 'approved'
        ? 'Verified'
        : property.is_published
          ? 'Live'
          : 'Draft',
    listingType: property.listing_type.charAt(0).toUpperCase() + property.listing_type.slice(1),
  };
}

export async function fetchPublishedProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_published', true)
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as DatabaseProperty[];
}

export async function fetchPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return (data as DatabaseProperty | null) ?? null;
}

export async function fetchSellerProperties(userId: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as DatabaseProperty[];
}

export async function createSellerProperty(userId: string, values: PropertyFormValues) {
  const payload = {
    owner_id: userId,
    title: values.title.trim(),
    listing_type: values.listingType,
    property_type: values.propertyType.trim() || 'flat',
    price: toNumber(values.price),
    state: values.state.trim(),
    city: values.city.trim(),
    address: values.address.trim() || null,
    location_text: `${values.city.trim()}, ${values.state.trim()}`,
    description: values.description.trim() || null,
    bedrooms: toNumber(values.bedrooms),
    bathrooms: toNumber(values.bathrooms),
    is_published: values.isPublished,
    verification_status: 'approved',
  };

  const { data, error } = await supabase.from('properties').insert(payload).select('*').single();

  if (error) throw error;

  return data as DatabaseProperty;
}

export async function updateSellerProperty(
  propertyId: string,
  userId: string,
  values: PropertyFormValues
) {
  const payload = {
    owner_id: userId,
    title: values.title.trim(),
    listing_type: values.listingType,
    property_type: values.propertyType.trim() || 'flat',
    price: toNumber(values.price),
    state: values.state.trim(),
    city: values.city.trim(),
    address: values.address.trim() || null,
    location_text: `${values.city.trim()}, ${values.state.trim()}`,
    description: values.description.trim() || null,
    bedrooms: toNumber(values.bedrooms),
    bathrooms: toNumber(values.bathrooms),
    is_published: values.isPublished,
    verification_status: 'approved',
  };

  const { data, error } = await supabase
    .from('properties')
    .update(payload)
    .eq('id', propertyId)
    .eq('owner_id', userId)
    .select('*')
    .single();

  if (error) throw error;

  return data as DatabaseProperty;
}

export async function fetchSellerStats(userId: string) {
  const [
    { count: propertyCount, error: propertyError },
    { count: inquiryCount, error: inquiryError },
    { count: viewingCount, error: viewingError },
  ] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('landlord_id', userId),
    supabase.from('viewing_requests').select('id', { count: 'exact', head: true }).eq('seller_id', userId),
  ]);

  if (propertyError) throw propertyError;
  if (inquiryError) throw inquiryError;
  if (viewingError) throw viewingError;

  return {
    propertyCount: propertyCount ?? 0,
    inquiryCount: inquiryCount ?? 0,
    viewingCount: viewingCount ?? 0,
  };
}

export async function fetchSellerInquiries(userId: string) {
  const { data: inquiryRows, error: inquiryError } = await supabase
    .from('inquiries')
    .select('*')
    .eq('landlord_id', userId)
    .order('created_at', { ascending: false });

  if (inquiryError) throw inquiryError;

  const propertyIds = Array.from(new Set((inquiryRows ?? []).map((row) => row.property_id).filter(Boolean)));

  let propertyMap = new Map<string, { title: string; location_text: string }>();

  if (propertyIds.length) {
    const { data: propertyRows, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, location_text')
      .in('id', propertyIds);

    if (propertyError) throw propertyError;

    propertyMap = new Map(
      (propertyRows ?? []).map((item) => [
        item.id,
        {
          title: item.title,
          location_text: item.location_text,
        },
      ])
    );
  }

  return (inquiryRows ?? []).map((row) => ({
    ...row,
    property_title: propertyMap.get(row.property_id)?.title ?? 'Property',
    property_location: propertyMap.get(row.property_id)?.location_text ?? 'Location unavailable',
  })) as SellerInquiryItem[];
}

export async function fetchSellerViewingRequests(userId: string) {
  const { data, error } = await supabase
    .from('viewing_requests')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as SellerViewingItem[];
}
