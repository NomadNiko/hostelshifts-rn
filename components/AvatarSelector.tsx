/**
 * AvatarSelector Component
 *
 * Single responsibility: Modal for selecting user avatar
 * KISS: Simple modal with left/right navigation and save/cancel
 * YAGNI: Only what's needed for avatar selection
 */
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../theme/colors';
import AvatarDisplay from './AvatarDisplay';

interface AvatarSelectorProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Current avatar number */
  currentAvatar?: number | null;
  /** User object for display */
  user?: { firstName?: string; lastName?: string } | null;
  /** Callback when avatar is selected and saved */
  onSave: (avatarNumber: number) => void;
  /** Callback when modal is closed without saving */
  onClose: () => void;
}

export default function AvatarSelector({
  visible,
  currentAvatar,
  user,
  onSave,
  onClose,
}: AvatarSelectorProps) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  // Local state for the currently selected avatar in the modal
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || 1);

  // Reset selection when modal opens
  React.useEffect(() => {
    if (visible) {
      setSelectedAvatar(currentAvatar || 1);
    }
  }, [visible, currentAvatar]);

  const handlePrevious = () => {
    setSelectedAvatar((prev) => (prev > 1 ? prev - 1 : 20));
  };

  const handleNext = () => {
    setSelectedAvatar((prev) => (prev < 20 ? prev + 1 : 1));
  };

  const handleSave = () => {
    onSave(selectedAvatar);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="border-b px-6 py-4" style={{ borderBottomColor: colors.grey4 }}>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={handleCancel}>
                <Text className="font-medium text-base" style={{ color: colors.grey }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="font-semibold text-lg" style={{ color: colors.foreground }}>
                Choose Avatar
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text className="font-semibold text-base" style={{ color: colors.primary }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar Selection */}
          <View className="flex-1 items-center justify-center px-8">
            {/* Current Selection Display */}
            <View className="mb-8 items-center">
              <AvatarDisplay
                user={user}
                avatarNumber={selectedAvatar}
                size="large"
                className="mb-4"
              />
              <Text className="font-medium text-lg" style={{ color: colors.foreground }}>
                Avatar {selectedAvatar}
              </Text>
              <Text className="text-sm" style={{ color: colors.grey2 }}>
                Tap the arrows to browse
              </Text>
            </View>

            {/* Navigation Controls */}
            <View className="flex-row items-center justify-center space-x-8">
              <TouchableOpacity
                className="rounded-full p-4"
                style={{ backgroundColor: colors.grey5 }}
                onPress={handlePrevious}>
                <Ionicons name="chevron-back" size={24} color={colors.foreground} />
              </TouchableOpacity>

              <View className="mx-8">
                <Text className="text-center font-bold text-2xl" style={{ color: colors.primary }}>
                  {selectedAvatar}
                </Text>
                <Text className="text-center text-xs" style={{ color: colors.grey2 }}>
                  of 20
                </Text>
              </View>

              <TouchableOpacity
                className="rounded-full p-4"
                style={{ backgroundColor: colors.grey5 }}
                onPress={handleNext}>
                <Ionicons name="chevron-forward" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Preview Grid */}
            <View className="mt-8">
              <Text className="mb-4 text-center text-sm" style={{ color: colors.grey2 }}>
                Preview other avatars
              </Text>
              <View className="max-w-sm flex-row flex-wrap justify-center">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <TouchableOpacity
                    key={num}
                    className="m-1"
                    onPress={() => setSelectedAvatar(num)}>
                    <View
                      className={selectedAvatar === num ? 'rounded-full border-2' : ''}
                      style={selectedAvatar === num ? { borderColor: colors.primary } : undefined}>
                      <AvatarDisplay
                        user={user}
                        avatarNumber={num}
                        size="small"
                        className={selectedAvatar !== num ? 'opacity-60' : ''}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
