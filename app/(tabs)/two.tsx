import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../theme/colors';
import ThemeToggle from '../../components/ThemeToggle';

export default function ProfileTab() {
  const { isDark } = useTheme();
  const { user, signOut } = useAuth();
  const colors = isDark ? COLORS.dark : COLORS.light;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <SafeAreaView>
        <View className="flex-row items-center justify-between px-6 py-4">
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Profile
          </Text>
          <ThemeToggle />
        </View>
      </SafeAreaView>

      <View className="flex-1 px-6" style={{ paddingBottom: 100 }}>
        {user && (
          <View className="mb-8">
            <Text className="text-xl font-semibold" style={{ color: colors.foreground }}>
              {user.firstName || user.lastName 
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : 'User Profile'
              }
            </Text>
            <Text className="mt-2 text-base" style={{ color: colors.grey }}>
              {user.email}
            </Text>
            {user.role && (
              <Text className="mt-1 text-sm" style={{ color: colors.grey2 }}>
                Role: {user.role.name || user.role.id}
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          className="rounded-lg py-4"
          style={{ backgroundColor: colors.destructive }}
          onPress={handleLogout}>
          <Text className="text-center text-base font-semibold text-white">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
