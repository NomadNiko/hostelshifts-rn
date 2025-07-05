/**
 * Avatar utilities for HostelShifts React Native app
 * Handles avatar images with optimization and fallback colors
 */
import { ImageSourcePropType } from 'react-native';

// Avatar images (require for bundling and optimization)
const AVATAR_IMAGES: { [key: number]: ImageSourcePropType } = {
  1: require('../assets/1.png'),
  2: require('../assets/2.png'),
  3: require('../assets/3.png'),
  4: require('../assets/4.png'),
  5: require('../assets/5.png'),
  6: require('../assets/6.png'),
  7: require('../assets/7.png'),
  8: require('../assets/8.png'),
  9: require('../assets/9.png'),
  10: require('../assets/10.png'),
  11: require('../assets/11.png'),
  12: require('../assets/12.png'),
  13: require('../assets/13.png'),
  14: require('../assets/14.png'),
  15: require('../assets/15.png'),
  16: require('../assets/16.png'),
  17: require('../assets/17.png'),
  18: require('../assets/18.png'),
  19: require('../assets/19.png'),
  20: require('../assets/20.png'),
};

// Fallback colors for loading states or missing images
export const AVATAR_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
  '#F8C471', // Orange
  '#82E0AA', // Light Green
  '#F1948A', // Pink
  '#AED6F1', // Sky Blue
  '#A9DFBF', // Pale Green
  '#F9E79F', // Pale Yellow
  '#D7BDE2', // Lavender
  '#A3E4D7', // Aqua
  '#FADBD8', // Light Pink
  '#D5DBDB', // Light Gray
];

/**
 * Get avatar color by number (1-20)
 */
export function getAvatarColor(avatarNumber: number | null | undefined): string {
  if (!avatarNumber || avatarNumber < 1 || avatarNumber > 20) {
    return AVATAR_COLORS[0]; // Default to first color
  }
  return AVATAR_COLORS[avatarNumber - 1]; // Convert 1-based to 0-based index
}

/**
 * Get avatar image source with optimization
 */
export function getAvatarImage(
  avatarNumber: number | null | undefined
): ImageSourcePropType | null {
  if (!avatarNumber || avatarNumber < 1 || avatarNumber > 20) {
    return AVATAR_IMAGES[1]; // Default to first image if no avatar
  }
  return AVATAR_IMAGES[avatarNumber];
}

/**
 * Get avatar source - now returns image with fallback color
 */
export function getAvatarSource(avatarNumber: number | null | undefined): {
  type: 'image';
  image: ImageSourcePropType;
  fallbackColor: string;
} {
  return {
    type: 'image',
    image: getAvatarImage(avatarNumber),
    fallbackColor: getAvatarColor(avatarNumber),
  };
}

/**
 * Get avatar display text (first letter of user's name or number)
 */
export function getAvatarText(
  user: { firstName?: string; lastName?: string } | null | undefined,
  avatarNumber: number | null | undefined
): string {
  if (user?.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }
  if (user?.lastName) {
    return user.lastName.charAt(0).toUpperCase();
  }
  if (avatarNumber) {
    return avatarNumber.toString();
  }
  return '?';
}

/**
 * Get contrasting text color for avatar background
 */
export function getAvatarTextColor(avatarNumber: number | null | undefined): string {
  if (!avatarNumber) return '#FFFFFF';

  // Light colors that need dark text
  const lightColorIndexes = [4, 5, 7, 8, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  if (lightColorIndexes.includes(avatarNumber)) {
    return '#333333';
  }

  return '#FFFFFF';
}
