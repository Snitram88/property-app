import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { FullScreenLoader } from '@/src/components/common/FullScreenLoader';
import { useAuth } from '@/src/providers/AuthProvider';

export default function SellerLayout() {
  const { user, profile, loading, hasSellerAccess } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  if (!profile?.onboarding_completed) {
    return <Redirect href="/onboarding/mode" />;
  }

  if (!hasSellerAccess) {
    return <Redirect href="/buyer" />;
  }

  if (profile.active_mode !== 'seller' && profile.active_mode !== 'admin') {
    return <Redirect href="/buyer" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Properties',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color, size }) => <Ionicons name="mail-open-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
