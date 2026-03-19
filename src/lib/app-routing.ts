import { Href } from 'expo-router';
import { Profile, UserRole } from '@/src/types/auth';

export function hasSellerAccess(roles: UserRole[]) {
  return roles.some((role) => role === 'landlord' || role === 'agent' || role === 'admin');
}

export function getHomeRoute(profile: Profile | null, roles: UserRole[]): Href {
  if (!profile || !profile.onboarding_completed) {
    return '/onboarding/mode';
  }

  if ((profile.active_mode === 'seller' || profile.active_mode === 'admin') && hasSellerAccess(roles)) {
    return '/seller';
  }

  return '/buyer';
}

export function formatRole(role: UserRole) {
  switch (role) {
    case 'buyer':
      return 'Buyer';
    case 'landlord':
      return 'Landlord';
    case 'agent':
      return 'Agent';
    case 'admin':
      return 'Admin';
    default:
      return role;
  }
}
