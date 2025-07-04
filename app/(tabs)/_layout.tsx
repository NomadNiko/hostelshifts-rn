import { Tabs } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../theme/colors';
import { TabBarIcon } from '../../components/TabBarIcon';
import ThemeToggle from '../../components/ThemeToggle';

export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: isDark ? COLORS.dark.primary : COLORS.light.primary,
        tabBarInactiveTintColor: isDark ? COLORS.dark.grey : COLORS.light.grey,
        tabBarStyle: {
          backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
          borderTopColor: isDark ? COLORS.dark.grey5 : COLORS.light.grey5,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
        },
        headerTintColor: isDark ? COLORS.white : COLORS.black,
        headerRight: () => <ThemeToggle size={24} />,
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Schedules',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="conversations"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
