import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
  minDisplayTime?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 100, 
  color = '#ffffff',
  backgroundColor = 'transparent',
  minDisplayTime = 1500
}) => {
  const progress = useSharedValue(0);
  const [shouldShow, setShouldShow] = useState(true);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Cube animation (bxSpin keyframes)
  const cubeAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 0.25, 0.5, 0.75, 1],
      [0, size * 0.2, size * 0.4, size * 0.2, 0]
    );

    const rotate = interpolate(
      progress.value,
      [0, 0.25, 0.5, 0.75, 1],
      [0, 22.5, 45, 67.5, 90]
    );

    const scaleY = interpolate(
      progress.value,
      [0, 0.5, 1],
      [1, 0.9, 1]
    );

    const borderRadius = interpolate(
      progress.value,
      [0, 0.17, 0.5, 1],
      [8, 8, size * 0.8, 8]
    );

    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` },
        { scaleY }
      ],
      borderRadius: Math.min(borderRadius, size / 2),
    };
  });

  // Shadow animation
  const shadowAnimatedStyle = useAnimatedStyle(() => {
    const scaleX = interpolate(
      progress.value,
      [0, 0.5, 1],
      [1, 1.2, 1]
    );

    return {
      transform: [{ scaleX }],
    };
  });

  const shadowHeight = Math.max(size * 0.1, 8);
  const shadowTop = size + size * 0.6; // Position shadow below the cube

  useEffect(() => {
    // Start the animation
    progress.value = withRepeat(
      withTiming(1, { duration: 500, easing: Easing.linear }),
      -1,
      false
    );

    // Minimum display time
    const timer = setTimeout(() => {
      setShouldShow(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [progress, minDisplayTime]);

  if (!shouldShow) {
    return null;
  }

  return (
    <View style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: screenWidth,
      height: screenHeight,
      backgroundColor: backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
      elevation: 99999,
    }}>
      <View style={{ 
        width: size, 
        height: size + shadowTop + shadowHeight, 
        position: 'relative',
        alignItems: 'center'
      }}>
        {/* Cube with Gradient */}
        <Animated.View
          style={[
            {
              width: size,
              height: size,
              borderRadius: 12,
              position: 'absolute',
              top: 0,
              left: 0,
              overflow: 'hidden',
            },
            cubeAnimatedStyle,
          ]}>
          <LinearGradient
            colors={['#ef4444', '#3b82f6']} // Red to Blue gradient
            style={{
              width: '100%',
              height: '100%',
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        
        {/* Shadow */}
        <Animated.View
          style={[
            {
              width: size,
              height: shadowHeight,
              backgroundColor: '#000',
              opacity: 0.3,
              position: 'absolute',
              top: shadowTop,
              left: 0,
              borderRadius: shadowHeight / 2,
            },
            shadowAnimatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

export default LoadingSpinner;