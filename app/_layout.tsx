import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/src/providers/AuthProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="buyer" />
          <Stack.Screen name="seller" />
          <Stack.Screen name="property/[id]" />
          <Stack.Screen name="inquiry/[propertyId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="viewing/[propertyId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="listing/create" />
          <Stack.Screen name="listing/edit/[id]" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
