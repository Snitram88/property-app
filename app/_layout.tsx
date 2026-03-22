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
          <Stack.Screen name="public/index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="buyer" />
          <Stack.Screen name="seller" />
          <Stack.Screen name="property/[id]" />
          <Stack.Screen name="messages/[conversationId]" />
          <Stack.Screen name="inquiry/[propertyId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="viewing/[propertyId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="listing/create" />
          <Stack.Screen name="listing/edit/[id]" />
          <Stack.Screen name="kyc/index" />
          <Stack.Screen name="game/index" />
          <Stack.Screen name="support/index" />
          <Stack.Screen name="admin/index" />
          <Stack.Screen name="admin/support" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
