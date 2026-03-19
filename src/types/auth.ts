export type UserRole = 'buyer' | 'landlord' | 'agent' | 'admin';
export type ActiveMode = 'buyer' | 'seller' | 'admin';
export type OnboardingStep = 'mode' | 'profile' | 'done';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  avatar_url: string | null;
  active_mode: ActiveMode;
  onboarding_completed: boolean;
  onboarding_step: OnboardingStep;
  seller_type: 'landlord' | 'agent' | null;
  preferred_locations: string | null;
  budget_min: number | null;
  budget_max: number | null;
  property_interest_type: string | null;
  company_name: string | null;
  notification_preferences: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};
