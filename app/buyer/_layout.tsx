import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { shadows } from '@/src/theme/shadows';

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={focused ? (name.replace('-outline', '') as keyof typeof Ionicons.glyphMap) : name}
      size={24}
      color={color}
    />
  );
}

export default function BuyerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 6,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 14,
          height: 78,
          paddingTop: 10,
          borderTopWidth: 0,
          borderRadius: radius.xl,
          backgroundColor: 'rgba(255,255,255,0.96)',
          ...shadows.strong,
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="search-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="heart-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chatbubble-ellipses-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
