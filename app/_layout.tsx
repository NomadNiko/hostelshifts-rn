import '../global.css';

import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SchedulesProvider } from '../contexts/SchedulesContext';
import { ConversationsProvider } from '../contexts/ConversationsContext';
import AuthScreen from '../screens/AuthScreen';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/colors';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View 
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.dark.background }}>
        <ActivityIndicator size="large" color={COLORS.dark.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <SchedulesProvider>
      <ConversationsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ConversationsProvider>
    </SchedulesProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
