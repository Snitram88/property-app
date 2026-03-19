import { Redirect, Stack } from 'expo-router';
import { FullScreenLoader } from '@/src/components/common/FullScreenLoader';
import { useAuth } from '@/src/providers/AuthProvider';
import { getHomeRoute } from '@/src/lib/app-routing';

export default function OnboardingLayout() {
  const { user, profile, roles, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  if (profile?.onboarding_completed) {
    return <Redirect href={getHomeRoute(profile, roles)} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
