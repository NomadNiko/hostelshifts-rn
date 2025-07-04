import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../theme/colors';
import { createMessagingStyles, MessagingColors } from '../components/messaging/styles';

export const useMessagingStyles = () => {
  const { isDark } = useTheme();

  const colors = useMemo(() => (isDark ? COLORS.dark : COLORS.light), [isDark]) as MessagingColors;
  const styles = useMemo(() => createMessagingStyles(colors, isDark), [colors, isDark]);

  return {
    colors,
    styles,
    isDark,
  };
};
