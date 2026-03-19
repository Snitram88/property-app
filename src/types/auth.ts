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
  created_at: string;
  updated_at: string;
};
