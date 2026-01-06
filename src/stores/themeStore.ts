/**
 * Theme Store - Soffitta NoWasteLand
 * 
 * Gestisce le preferenze visive dell'utente:
 * - Tema colori (warm, dark, forest, ocean)
 * - Personalizzazioni future
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, THEMES, ColorPalette, DEFAULT_THEME } from '../theme/colors';

interface ThemeState {
  // Current theme
  themeMode: ThemeMode;
  colors: ColorPalette;
  
  // Actions
  setTheme: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: DEFAULT_THEME,
      colors: THEMES[DEFAULT_THEME],
      
      setTheme: (mode: ThemeMode) => {
        set({
          themeMode: mode,
          colors: THEMES[mode],
        });
      },
      
      toggleDarkMode: () => {
        const current = get().themeMode;
        const newMode = current === 'dark' ? 'warm' : 'dark';
        set({
          themeMode: newMode,
          colors: THEMES[newMode],
        });
      },
    }),
    {
      name: 'soffitta-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.colors = THEMES[state.themeMode];
        }
      },
    }
  )
);

// Hook helper per usare i colori direttamente
export const useColors = () => useThemeStore((state) => state.colors);
export const useThemeMode = () => useThemeStore((state) => state.themeMode);
