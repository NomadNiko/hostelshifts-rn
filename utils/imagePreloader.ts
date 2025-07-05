/**
 * Image preloader utility for avatar optimization
 * Preloads avatar images to improve performance
 */
import { Asset } from 'expo-asset';

// Pre-require all avatar images for bundling
const AVATAR_ASSETS = [
  require('../assets/1.png'),
  require('../assets/2.png'),
  require('../assets/3.png'),
  require('../assets/4.png'),
  require('../assets/5.png'),
  require('../assets/6.png'),
  require('../assets/7.png'),
  require('../assets/8.png'),
  require('../assets/9.png'),
  require('../assets/10.png'),
  require('../assets/11.png'),
  require('../assets/12.png'),
  require('../assets/13.png'),
  require('../assets/14.png'),
  require('../assets/15.png'),
  require('../assets/16.png'),
  require('../assets/17.png'),
  require('../assets/18.png'),
  require('../assets/19.png'),
  require('../assets/20.png'),
];

/**
 * Preload all avatar images for better performance
 * Uses Expo Asset for optimized preloading
 */
export async function preloadAvatarImages(): Promise<void> {
  try {
    console.log('Preloading avatar images...');
    const assets = AVATAR_ASSETS.map((asset) => Asset.fromModule(asset));
    await Promise.all(assets.map((asset) => asset.downloadAsync()));
    console.log('Avatar images preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload some avatar images:', error);
  }
}

/**
 * Preload specific avatar images by numbers
 */
export async function preloadSpecificAvatars(avatarNumbers: number[]): Promise<void> {
  try {
    const assetsToPreload = avatarNumbers
      .filter((num) => num >= 1 && num <= 20)
      .map((num) => Asset.fromModule(AVATAR_ASSETS[num - 1]));

    await Promise.all(assetsToPreload.map((asset) => asset.downloadAsync()));
  } catch (error) {
    console.warn('Failed to preload specific avatars:', error);
  }
}
