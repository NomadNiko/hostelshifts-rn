import '../global.css';

import { Stack } from 'expo-router';
import {
  useFonts,
  Oxanium_400Regular,
  Oxanium_500Medium,
  Oxanium_600SemiBold,
  Oxanium_700Bold,
} from '@expo-google-fonts/oxanium';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SchedulesProvider } from '../contexts/SchedulesContext';
import { ConversationsProvider } from '../contexts/ConversationsContext';
import { TimeClockProvider } from '../contexts/TimeClockContext';
import AuthScreen from '../screens/AuthScreen';
import { View } from 'react-native';
import { COLORS } from '../theme/colors';
import LoadingSpinner from '../components/LoadingSpinner';

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
        <LoadingSpinner size={48} color={COLORS.dark.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <SchedulesProvider>
      <ConversationsProvider>
        <TimeClockProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </TimeClockProvider>
      </ConversationsProvider>
    </SchedulesProvider>
  );
}

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    Oxanium_400Regular,
    Oxanium_500Medium,
    Oxanium_600SemiBold,
    Oxanium_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.dark.background }}>
        <LoadingSpinner size={48} color={COLORS.dark.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
