import { supabase } from '@/src/lib/supabase/client';

export type KycSubmission = {
  id: string;
  user_id: string;
  seller_type: string | null;
  business_name: string | null;
  company_registration_number: string | null;
  government_id_number: string | null;
  contact_address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
};

export type AdminKycQueueItem = {
  submission_id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  seller_type: string | null;
  business_name: string | null;
  company_registration_number: string | null;
  government_id_number: string | null;
  contact_address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  status: string;
  submitted_at: string;
};

export type AdminListingQueueItem = {
  property_id: string;
  owner_id: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  owner_verification_status: string;
  title: string;
  listing_type: string;
  property_type: string;
  price: number;
  location_text: string;
  verification_status: string;
  created_at: string;
};

export async function fetchMyKycSubmission(userId: string) {
  const { data, error } = await supabase
    .from('kyc_submissions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as KycSubmission | null) ?? null;
}

export async function submitSellerKyc(input: {
  businessName: string;
  companyRegistrationNumber: string;
  governmentIdNumber: string;
  contactAddress: string;
  city: string;
  state: string;
  notes: string;
}) {
  const { data, error } = await supabase.rpc('submit_seller_kyc', {
    p_business_name: input.businessName,
    p_company_registration_number: input.companyRegistrationNumber,
    p_government_id_number: input.governmentIdNumber,
    p_contact_address: input.contactAddress,
    p_city: input.city,
    p_state: input.state,
    p_notes: input.notes,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function fetchAdminKycQueue() {
  const { data, error } = await supabase.rpc('admin_get_kyc_queue');

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminKycQueueItem[];
}

export async function reviewKycSubmission(input: {
  submissionId: string;
  decision: 'approved' | 'rejected';
  reviewNotes?: string;
}) {
  const { data, error } = await supabase.rpc('admin_review_kyc', {
    p_submission_id: input.submissionId,
    p_decision: input.decision,
    p_review_notes: input.reviewNotes ?? null,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function fetchAdminListingQueue() {
  const { data, error } = await supabase.rpc('admin_get_listing_queue');

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminListingQueueItem[];
}

export async function reviewListing(input: {
  propertyId: string;
  decision: 'approved' | 'rejected';
  reviewNotes?: string;
}) {
  const { data, error } = await supabase.rpc('admin_review_listing', {
    p_property_id: input.propertyId,
    p_decision: input.decision,
    p_review_notes: input.reviewNotes ?? null,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export function formatVerificationStatus(status?: string | null) {
  if (!status) return 'Unknown';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
