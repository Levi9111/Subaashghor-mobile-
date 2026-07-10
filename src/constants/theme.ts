/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#3e0d12', // Maroon
    background: '#e5ded4', // Cream / Beige
    primary: '#3e0d12', // Maroon
    secondary: '#c9a84c', // Gold
    accent: '#c9a84c',
    card: '#ebe4da', // Slightly lighter cream
    border: 'rgba(201, 168, 76, 0.25)', // Subtle gold border
    muted: '#625b52',
    backgroundElement: '#ebe4da',
    backgroundSelected: '#dfd8ce',
    textSecondary: '#625b52',
  },
  dark: {
    text: '#e5ded4', // Cream / Beige
    background: '#1c0507', // Very dark maroon/black
    primary: '#c9a84c', // Gold
    secondary: '#3e0d12', // Maroon
    accent: '#c9a84c',
    card: '#29090c', // Slightly lighter dark maroon
    border: 'rgba(201, 168, 76, 0.25)',
    muted: '#a59e95',
    backgroundElement: '#29090c',
    backgroundSelected: '#3e0d12',
    textSecondary: '#a59e95',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
