export const FONTS = {
  regular: 'Oxanium_400Regular',
  medium: 'Oxanium_500Medium',
  semibold: 'Oxanium_600SemiBold',
  bold: 'Oxanium_700Bold',
};

// Helper function to get text style with Oxanium font
export const getTextStyle = (weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') => ({
  fontFamily: FONTS[weight],
});

// Common text styles with Oxanium font
export const TEXT_STYLES = {
  regular: { fontFamily: FONTS.regular },
  medium: { fontFamily: FONTS.medium },
  semibold: { fontFamily: FONTS.semibold },
  bold: { fontFamily: FONTS.bold },
};
