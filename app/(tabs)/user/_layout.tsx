import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/constants/design';

export default function UserTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: spacing.sm,
          paddingTop: spacing.xs,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color, size }) => <Ionicons name="apps" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-borrows"
        options={{
          title: 'My Borrows',
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmarks" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
