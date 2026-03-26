// Design tokens matching the Admin Dashboard Deep Navy theme
export const COLORS = {
  bg: '#0a1628',
  panel: '#111e30',
  card: '#152035',
  border: '#1e3050',
  accent: '#00e5ff',    // cyan
  accentGreen: '#00FFA3', // from spec
  gold: '#ffc107',
  red: '#ef5350',
  purple: '#7c4dff',
  text: '#e8f4fd',
  muted: '#4a6882',
  dim: '#253d55',
  white: '#ffffff',
};

// Gradient combos (pass to LinearGradient colors prop)
export const GRADIENTS = {
  hero: ['#00E0FF', '#00FFA3'] as const,
  court: ['#7c4dff', '#00e5ff'] as const,
  gold: ['#ffc107', '#ff6f00'] as const,
  danger: ['#ef5350', '#c62828'] as const,
  card: ['#152035', '#0a1628'] as const,
};

export const FONTS = {
  mono: 'monospace' as const,
  // In Expo you'd load Bebas Neue with expo-font; using system for now
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};
