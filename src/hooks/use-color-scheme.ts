import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme as useNativeColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = "sg-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const nativeScheme = useNativeColorScheme();
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark for premium luxury branding

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(KEY);
        if (stored === 'light' || stored === 'dark') {
          setThemeState(stored);
        } else {
          setThemeState(nativeScheme === 'dark' ? 'dark' : 'light');
        }
      } catch {}
    };
    loadTheme();
  }, [nativeScheme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    try {
      await AsyncStorage.setItem(KEY, nextTheme);
    } catch {}
  };

  return React.createElement(Ctx.Provider, { value: { theme, toggleTheme } }, children);
}

export function useColorScheme() {
  const context = useContext(Ctx);
  return context ? context.theme : 'light';
}

export function useThemeToggle() {
  const context = useContext(Ctx);
  if (!context) throw new Error('useThemeToggle must be used within ThemeProvider');
  return context;
}
