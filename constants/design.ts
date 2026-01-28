/**
 * Design Token System
 *
 * Centralized design tokens for consistent theming across the app.
 * Using Emerald Green and #F0EDDB as primary colors.
 * Montserrat font family for all typography.
 */

import { Platform } from 'react-native';

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Brand Colors
  primary: '#10B981', // Emerald Green
  primaryDark: '#059669',
  primaryLight: '#34D399',
  primaryTint: '#ECFDF5',

  secondary: '#F0EDDB', // requested cream/light green tint
  secondaryDark: '#E5E1C4',
  secondaryLight: '#F9F8F0',
  secondaryTint: '#FDFDFB',

  accent: '#059669',
  accentDark: '#047857',
  accentLight: '#10B981',
  accentTint: '#D1FAE5',

  // Background Colors
  background: '#F0EDDB',
  backgroundSecondary: '#E5E1C4',
  backgroundTertiary: '#D6D1A8',

  // Dark Mode Backgrounds
  backgroundDark: '#064E3B',
  backgroundDarkSecondary: '#065F46',
  backgroundDarkTertiary: '#047857',

  // Text Colors
  text: '#1F2937',
  textSecondary: '#4B5563',
  textTertiary: '#6B7280',
  textDisabled: '#9CA3AF',

  // Dark Mode Text
  textDark: '#F9FAFB',
  textDarkSecondary: '#F3F4F6',
  textDarkTertiary: '#D1D5DB',

  // Semantic Colors
  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',
  successTint: '#D1FAE5',

  error: '#EF4444',
  errorDark: '#DC2626',
  errorLight: '#F87171',
  errorTint: '#FEE2E2',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',
  warningTint: '#FEF3C7',

  info: '#3B82F6',
  infoDark: '#2563EB',
  infoLight: '#60A5FA',
  infoTint: '#DBEAFE',

  // Border Colors
  border: '#D1D5DB',
  borderDark: '#9CA3AF',
  borderLight: '#E5E7EB',

  // Dark Mode Borders
  borderDarkMode: '#065F46',
  borderDarkModeLight: '#047857',

  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Special Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  xxxxl: 96,
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  display: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h4: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyBold: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  captionBold: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  small: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  smallBold: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  tiny: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0,
  },
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

// ============================================================================
// TOUCH TARGETS
// ============================================================================

export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
};

// ============================================================================
// OPACITY
// ============================================================================

export const opacity = {
  disabled: 0.4,
  pressed: 0.7,
  hover: 0.8,
  overlay: 0.5,
  overlayLight: 0.3,
  overlayDark: 0.7,
};

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
};

// ============================================================================
// ICON SIZES
// ============================================================================

export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// ============================================================================
// AVATAR SIZES
// ============================================================================

export const avatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  xxl: 120,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const withOpacity = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getThemedColor = (
  lightColor: string,
  darkColor: string,
  isDark: boolean
): string => {
  return isDark ? darkColor : lightColor;
};
