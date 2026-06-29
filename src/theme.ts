import { useColorScheme } from 'react-native';

/** A two-stop gradient (LinearGradient `colors` prop). */
type Gradient = readonly [string, string];

/**
 * "Fresh & Friendly" brand palette.
 * Emerald primary + warm coral accent over soft cream surfaces (light)
 * or a green-tinged charcoal (dark). Shared brand hues live in `brand`,
 * mode-specific surfaces/text override on top.
 */
const brand = {
  primary: '#10b981', // emerald-500
  primaryDark: '#059669', // emerald-600
  primaryLight: '#34d399', // emerald-400
  teal: '#0d9488', // teal-600 (gradient end)
  coral: '#ff6b5d',
  coralDark: '#f4503f',
  gold: '#f59e0b', // amber-500, used for points / highlights
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
};

const darkTheme = {
  ...brand,
  // `accent` is kept for backwards-compat — it now maps to the emerald primary
  accent: brand.primary,
  background: '#0d1210',
  surface: '#161d1a',
  card: '#161d1a',
  cardElevated: '#1c2521',
  border: '#26302b',
  text: '#f4f6f5',
  textSecondary: '#9aa6a0',
  textTertiary: '#6a746f',
  inputBackground: '#161d1a',
  onPrimary: '#ffffff',
  onGradient: '#ffffff',
  // QR cards stay light so scanners read them reliably in any mode
  qrSurface: '#ffffff',
  gradients: {
    brand: ['#10b981', '#0d9488'] as Gradient, // emerald → teal (hero card)
    button: ['#10b981', '#059669'] as Gradient,
    coral: ['#ff7d70', '#f4503f'] as Gradient,
    app: ['#0d1210', '#101a15'] as Gradient, // subtle screen backdrop
  },
  shadow: {
    color: '#000000',
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 6,
    },
    hero: {
      shadowColor: '#0d9488',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 22,
      elevation: 12,
    },
  },
};

const lightTheme: typeof darkTheme = {
  ...brand,
  accent: brand.primary,
  background: '#faf9f6', // warm cream
  surface: '#ffffff',
  card: '#ffffff',
  cardElevated: '#ffffff',
  border: '#ece9e3', // warm hairline
  text: '#1c1c1e', // charcoal, not pure black
  textSecondary: '#6b6b70',
  textTertiary: '#9b9ba0',
  inputBackground: '#f3f1ec',
  onPrimary: '#ffffff',
  onGradient: '#ffffff',
  qrSurface: '#ffffff',
  gradients: {
    brand: ['#10b981', '#0d9488'] as Gradient,
    button: ['#10b981', '#059669'] as Gradient,
    coral: ['#ff7d70', '#f4503f'] as Gradient,
    app: ['#faf9f6', '#f3f6f3'] as Gradient,
  },
  shadow: {
    color: '#1c2b25',
    card: {
      shadowColor: '#1f2d27',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    hero: {
      shadowColor: '#0d9488',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.28,
      shadowRadius: 22,
      elevation: 10,
    },
  },
};

export type Theme = typeof darkTheme;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
