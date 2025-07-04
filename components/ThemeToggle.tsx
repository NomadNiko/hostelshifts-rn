import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../theme/colors';

export interface ThemeToggleProps {
  size?: number;
}

export default function ThemeToggle({ size = 24 }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      className="rounded-full p-2"
      style={{
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        marginRight: 4,
      }}>
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={size}
        color={isDark ? COLORS.dark.primary : COLORS.light.primary}
      />
    </Pressable>
  );
}
