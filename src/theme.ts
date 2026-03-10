import { useColorScheme } from 'react-native';

const palette = {
  accent: '#0a84ff',
  success: '#30d158',
  error: '#ff453a',
  warning: '#ff9f0a',
};

const darkTheme = {
  ...palette,
  background: '#0f0f0f',
  surface: '#1a1a1a',
  card: '#1a1a1a',
  border: '#333',
  text: '#fff',
  textSecondary: '#888',
  textTertiary: '#666',
  inputBackground: '#1a1a1a',
};

const lightTheme = {
  ...palette,
  background: '#f5f5f7',
  surface: '#ffffff',
  card: '#ffffff',
  border: '#e0e0e0',
  text: '#000',
  textSecondary: '#666',
  textTertiary: '#999',
  inputBackground: '#ffffff',
};

export type Theme = typeof darkTheme;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
