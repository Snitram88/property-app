import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="properties"
        options={{
          title: 'My Properties',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="inquiries"
        options={{
          title: 'Inquiries',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="leads"
        options={{
          title: 'Leads',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="viewings"
        options={{
          title: 'Viewings',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="viewing-reschedule/[id]"
        options={{
          title: 'Reschedule Viewing',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
