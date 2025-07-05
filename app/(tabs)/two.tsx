import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../theme/colors';
import ThemeToggle from '../../components/ThemeToggle';
import AvatarDisplay from '../../components/AvatarDisplay';
import AvatarSelector from '../../components/AvatarSelector';
import HostelShiftsLogo from '../../components/HostelShiftsLogo';
import { TEXT_STYLES } from '../../theme/fonts';

export default function ProfileTab() {
  const { isDark } = useTheme();
  const { user, signOut, updateAvatar } = useAuth();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animation values - use useRef to persist across renders
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // Start animation only once on component mount
  useEffect(() => {
    if (!hasAnimated) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setHasAnimated(true);
      });
    }
  }, [hasAnimated, slideAnim, opacityAnim]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleAvatarPress = () => {
    setShowAvatarSelector(true);
  };

  const handleAvatarSave = async (avatarNumber: number) => {
    try {
      setIsUpdatingAvatar(true);
      await updateAvatar(avatarNumber);
      setShowAvatarSelector(false);
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch {
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleAvatarClose = () => {
    setShowAvatarSelector(false);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center justify-between px-6 pb-4">
          <View>
            <Text
              className="font-bold text-2xl"
              style={{ color: colors.foreground, ...TEXT_STYLES.bold }}>
              Profile
            </Text>
            <Text className="text-sm" style={{ color: colors.grey, ...TEXT_STYLES.regular }}>
              Welcome back, {user?.firstName || user?.email}!
            </Text>
          </View>
          <ThemeToggle />
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {user && (
          <>
            {/* Logo Section */}
            {hasAnimated ? (
              <View className="items-center px-6 py-6">
                <HostelShiftsLogo width={280} height={93} />
              </View>
            ) : (
              <Animated.View
                className="items-center px-6 py-6"
                style={{
                  opacity: opacityAnim,
                  transform: [
                    {
                      scale: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                }}>
                <HostelShiftsLogo width={280} height={93} />
              </Animated.View>
            )}

            {/* Avatar Section */}
            <View className="items-center px-6 py-8">
              <TouchableOpacity
                onPress={handleAvatarPress}
                disabled={isUpdatingAvatar}
                className="items-center">
                <AvatarDisplay
                  user={user}
                  avatarNumber={user.avatar}
                  size="large"
                  className={isUpdatingAvatar ? 'opacity-50' : ''}
                />
                <View className="mt-3 flex-row items-center">
                  <Text className="font-medium text-base" style={{ color: colors.primary }}>
                    Change Avatar
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.primary}
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* User Info Section */}
            <View className="mt-8 px-6">
              <View
                style={{
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.20)',
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                  borderWidth: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                {/* Gloss overlay */}
                <LinearGradient
                  colors={
                    isDark
                      ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']
                      : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    borderRadius: 12,
                    opacity: 0.8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
                {/* Lens effect */}
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    right: 2,
                    bottom: 2,
                    borderRadius: 10,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                    opacity: 0.3,
                  }}
                />
                {/* Content */}
                <View style={{ position: 'relative', zIndex: 10 }}>
                  <Text
                    className="mb-4 font-semibold text-lg"
                    style={{ color: colors.foreground, ...TEXT_STYLES.semibold }}>
                    Account Information
                  </Text>

                  <View className="space-y-3">
                    <View>
                      <Text
                        className="font-medium text-sm"
                        style={{ color: colors.grey2, ...TEXT_STYLES.medium }}>
                        Name
                      </Text>
                      <Text
                        className="text-base"
                        style={{ color: colors.foreground, ...TEXT_STYLES.regular }}>
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : 'Not set'}
                      </Text>
                    </View>

                    <View>
                      <Text
                        className="font-medium text-sm"
                        style={{ color: colors.grey2, ...TEXT_STYLES.medium }}>
                        Email
                      </Text>
                      <Text
                        className="text-base"
                        style={{ color: colors.foreground, ...TEXT_STYLES.regular }}>
                        {user.email}
                      </Text>
                    </View>

                    {user.role && (
                      <View>
                        <Text
                          className="font-medium text-sm"
                          style={{ color: colors.grey2, ...TEXT_STYLES.medium }}>
                          Role
                        </Text>
                        <Text
                          className="text-base"
                          style={{ color: colors.foreground, ...TEXT_STYLES.regular }}>
                          {user.role.name || user.role.id}
                        </Text>
                      </View>
                    )}

                    <View>
                      <Text
                        className="font-medium text-sm"
                        style={{ color: colors.grey2, ...TEXT_STYLES.medium }}>
                        Avatar
                      </Text>
                      <Text
                        className="text-base"
                        style={{ color: colors.foreground, ...TEXT_STYLES.regular }}>
                        {user.avatar ? `Avatar ${user.avatar}` : 'Default'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Actions Section */}
            <View className="mt-8 px-6">
              <TouchableOpacity className="rounded-lg" onPress={handleLogout}>
                <View
                  style={{
                    borderRadius: 12,
                    paddingVertical: 16,
                    backgroundColor: isDark ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.08)',
                    borderColor: isDark ? 'rgba(220, 38, 38, 0.4)' : 'rgba(220, 38, 38, 0.3)',
                    borderWidth: 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    alignItems: 'center',
                  }}>
                  {/* Gloss overlay with red tint */}
                  <LinearGradient
                    colors={
                      isDark
                        ? ['rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.15)', 'transparent']
                        : ['rgba(220, 38, 38, 0.3)', 'rgba(220, 38, 38, 0.08)', 'transparent']
                    }
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '60%',
                      borderRadius: 12,
                      opacity: 0.8,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                  {/* Lens effect */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: 2,
                      right: 2,
                      bottom: 2,
                      borderRadius: 10,
                      backgroundColor: isDark
                        ? 'rgba(220, 38, 38, 0.08)'
                        : 'rgba(220, 38, 38, 0.04)',
                      opacity: 0.3,
                    }}
                  />
                  {/* Content */}
                  <View style={{ position: 'relative', zIndex: 10 }}>
                    <Text
                      className="text-center font-semibold text-base"
                      style={{ color: isDark ? 'white' : 'black', ...TEXT_STYLES.semibold }}>
                      Sign Out
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Avatar Selector Modal */}
      <AvatarSelector
        visible={showAvatarSelector}
        currentAvatar={user?.avatar}
        user={user}
        onSave={handleAvatarSave}
        onClose={handleAvatarClose}
      />
    </View>
  );
}
