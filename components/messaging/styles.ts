export interface MessagingColors {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  grey: string;
  grey2: string;
  grey3: string;
  grey4: string;
  grey5: string;
  destructive: string;
  success: string;
  warning: string;
}

// Base styling templates
export const createMessagingStyles = (colors: MessagingColors, isDark: boolean) => ({
  // Container styles
  container: {
    base: `flex-1 rounded-t`,
    card: `rounded p-4`,
    cardWithBorder: `rounded p-4 border`,
    cardElevated: `rounded p-4`,
  },

  // Text styles
  text: {
    title: `text-2xl font-bold`,
    subtitle: `text-sm`,
    body: `text-base`,
    caption: `text-xs`,
    timestamp: `text-xs`,
  },

  // Button styles
  button: {
    primary: `rounded p-3`,
    secondary: `rounded p-3`,
    icon: `rounded p-2`,
    send: `rounded`,
  },

  // Avatar styles
  avatar: {
    small: `rounded items-center justify-center`,
    medium: `rounded items-center justify-center`,
    large: `rounded items-center justify-center`,
  },

  // Message styles
  message: {
    bubble: `px-5 py-4 rounded`,
    input: `rounded px-5 py-3`,
    inputContainer: `flex-row items-end`,
  },

  // Layout styles
  layout: {
    header: `flex-row items-center justify-between px-6 py-4`,
    headerWithBorder: `flex-row items-center justify-between px-6 py-5 border-b rounded-b`,
    list: `px-4 pt-4`,
    listItem: `mb-3 rounded px-5 py-5`,
  },

  // Shadow configurations
  shadow: {
    small: {
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
    },
  },

  // Color styles (computed)
  colors: {
    background: { backgroundColor: colors.background },
    card: { backgroundColor: colors.card },
    cardTransparent: { backgroundColor: colors.card + '50' },
    cardLight: { backgroundColor: colors.card + '30' },
    primary: { backgroundColor: colors.primary },
    primaryLight: { backgroundColor: colors.primary + '15' },
    primaryTransparent: { backgroundColor: colors.primary + '20' },
    grey5: { backgroundColor: colors.grey5 },

    // Text colors
    textPrimary: { color: colors.foreground },
    textSecondary: { color: colors.grey },
    textCaption: { color: colors.grey2 },
    textMuted: { color: colors.grey3 },
    textSuccess: { color: colors.success },
    textWarning: { color: colors.warning },
    textDestructive: { color: colors.destructive },
    textPrimaryColor: { color: colors.primary },
    textWhite: { color: 'white' },

    // Border colors
    borderGrey: { borderColor: colors.grey4 },
    borderPrimary: { borderColor: colors.primary },
    borderLight: { borderColor: colors.grey5 },
  },
});

// Dimension constants
export const DIMENSIONS = {
  avatar: {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 56, height: 56 },
  },
  button: {
    small: { width: 40, height: 40 },
    medium: { width: 48, height: 48 },
    large: { width: 52, height: 52 },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
} as const;

// Animation constants
export const ANIMATIONS = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;
