import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="properties" />
      <Stack.Screen name="inquiries" />
      <Stack.Screen name="viewings" />
      <Stack.Screen name="viewing-reschedule/[id]" />
    </Stack>
  );
}
