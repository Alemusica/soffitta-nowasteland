/**
 * Soffitta - NoWasteLand
 * Typography System
 * 
 * Swiss Typography inspired - clean, minimal, functional
 * Using Inter as primary (similar to Helvetica Neue)
 */

export const FONTS = {
  // Primary: Clean sans-serif (Swiss style)
  primary: {
    light: 'Inter_300Light',
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  // Mono: For codes/numbers
  mono: {
    regular: 'SpaceMono_400Regular',
  },
  // System fallbacks
  system: {
    regular: 'System',
  },
};

export const FONT_SIZES = {
  // Display
  display: 48,
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  
  // Body
  bodyLarge: 17,
  body: 15,
  bodySmall: 13,
  
  // UI
  label: 12,
  caption: 11,
  micro: 10,
};

export const LINE_HEIGHTS = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
};

export const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

// Predefined text styles (Swiss Typography)
export const TEXT_STYLES = {
  // Headings - clean, tight
  display: {
    fontSize: FONT_SIZES.display,
    fontWeight: '300' as const,
    letterSpacing: LETTER_SPACING.tight,
    lineHeight: LINE_HEIGHTS.tight,
  },
  h1: {
    fontSize: FONT_SIZES.h1,
    fontWeight: '600' as const,
    letterSpacing: LETTER_SPACING.tight,
    lineHeight: LINE_HEIGHTS.tight,
  },
  h2: {
    fontSize: FONT_SIZES.h2,
    fontWeight: '600' as const,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: LINE_HEIGHTS.tight,
  },
  h3: {
    fontSize: FONT_SIZES.h3,
    fontWeight: '500' as const,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: LINE_HEIGHTS.normal,
  },
  h4: {
    fontSize: FONT_SIZES.h4,
    fontWeight: '500' as const,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: LINE_HEIGHTS.normal,
  },
  
  // Body
  bodyLarge: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '400' as const,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: LINE_HEIGHTS.relaxed,
  },
  body: {
    fontSize: FONT_SIZES.body,
    fontWeight: '400' as const,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: LINE_HEIGHTS.relaxed,
  },
  bodySmall: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '400' as const,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: LINE_HEIGHTS.normal,
  },
  
  // UI Elements
  label: {
    fontSize: FONT_SIZES.label,
    fontWeight: '500' as const,
    letterSpacing: LETTER_SPACING.wider,
    lineHeight: LINE_HEIGHTS.tight,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: FONT_SIZES.caption,
    fontWeight: '400' as const,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: LINE_HEIGHTS.normal,
  },
  
  // Button
  button: {
    fontSize: FONT_SIZES.body,
    fontWeight: '500' as const,
    letterSpacing: LETTER_SPACING.wide,
    lineHeight: LINE_HEIGHTS.tight,
  },
  buttonSmall: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: '500' as const,
    letterSpacing: LETTER_SPACING.wide,
    lineHeight: LINE_HEIGHTS.tight,
  },
};

// Spacing system (8px grid - Swiss design)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
