/**
 * AvatarDisplay Component
 *
 * Single responsibility: Display user avatar in a circle
 * KISS: Simple avatar display with optimized images and fallback
 * YAGNI: Only what's needed for avatar display
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { getAvatarSource, getAvatarText, getAvatarTextColor } from '../utils/avatarUtils';

interface AvatarDisplayProps {
  /** User object with name information */
  user?: { firstName?: string; lastName?: string } | null;
  /** Avatar number (1-20) */
  avatarNumber?: number | null;
  /** Size of the avatar circle */
  size?: 'small' | 'medium' | 'large';
  /** Whether the avatar is clickable */
  onPress?: () => void;
  /** Additional style classes */
  className?: string;
}

export default function AvatarDisplay({
  user,
  avatarNumber,
  size = 'medium',
  onPress,
  className = '',
}: AvatarDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const avatarSource = getAvatarSource(avatarNumber);
  const avatarText = getAvatarText(user, avatarNumber);
  const textColor = getAvatarTextColor(avatarNumber);

  // Size mapping for containers
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20',
  };

  // Size mapping for images (same as container)
  const imageSizes = {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 80, height: 80 },
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-base',
    large: 'text-2xl',
  };

  const Component = onPress ? TouchableOpacity : View;

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Component
      className={`${sizeClasses[size]} rounded-full overflow-hidden items-center justify-center ${className}`}
      style={{ 
        backgroundColor: imageError ? avatarSource.fallbackColor : 'transparent'
      }}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}>
      {!imageError ? (
        <Image
          source={avatarSource.image}
          style={{
            ...imageSizes[size],
            borderRadius: imageSizes[size].width / 2, // Make image circular
          }}
          onError={handleImageError}
          resizeMode="cover"
          // Optimization props
          fadeDuration={200}
          defaultSource={undefined} // Prevents flash
        />
      ) : (
        // Fallback to colored circle with text
        <View 
          className={`${sizeClasses[size]} items-center justify-center rounded-full`}
          style={{ backgroundColor: avatarSource.fallbackColor }}>
          <Text className={`${textSizeClasses[size]} font-bold`} style={{ color: textColor }}>
            {avatarText}
          </Text>
        </View>
      )}
    </Component>
  );
}
