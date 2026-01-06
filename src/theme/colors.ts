/**
 * Soffitta - NoWasteLand
 * Color System
 * 
 * Swiss Typography inspired, minimal, relaxing studio vibes
 * Inspired by Valhalla DSP aesthetic - soft, professional, calming
 */

export type ThemeMode = 'light' | 'dark' | 'warm' | 'forest' | 'ocean';

export interface ColorPalette {
  // Base
  background: string;
  surface: string;
  surfaceElevated: string;
  
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Accent
  primary: string;
  primaryMuted: string;
  secondary: string;
  
  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // UI
  border: string;
  borderLight: string;
  divider: string;
  
  // Interactive
  buttonPrimary: string;
  buttonSecondary: string;
  inputBackground: string;
}

// Default: Warm Studio (Valhalla DSP inspired)
export const THEME_WARM_STUDIO: ColorPalette = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F3F0',
  
  text: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#8A8A8A',
  
  primary: '#C4A77D', // Warm gold
  primaryMuted: '#E8DCC8',
  secondary: '#7D9C8C', // Sage green
  
  success: '#7D9C8C',
  warning: '#D4A574',
  error: '#C47D7D',
  info: '#7D8FC4',
  
  border: '#E5E2DD',
  borderLight: '#F0EDE8',
  divider: '#E8E5E0',
  
  buttonPrimary: '#C4A77D',
  buttonSecondary: '#F0EDE8',
  inputBackground: '#FAFAF8',
};

// Dark Studio
export const THEME_DARK_STUDIO: ColorPalette = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceElevated: '#252525',
  
  text: '#F5F5F5',
  textSecondary: '#B0B0B0',
  textMuted: '#707070',
  
  primary: '#D4B896', // Warm gold
  primaryMuted: '#3D3528',
  secondary: '#8FB5A3', // Sage green
  
  success: '#8FB5A3',
  warning: '#E5B888',
  error: '#D49090',
  info: '#90A0D4',
  
  border: '#2A2A2A',
  borderLight: '#333333',
  divider: '#252525',
  
  buttonPrimary: '#D4B896',
  buttonSecondary: '#2A2A2A',
  inputBackground: '#1F1F1F',
};

// Forest (calming green)
export const THEME_FOREST: ColorPalette = {
  background: '#F5F7F5',
  surface: '#FFFFFF',
  surfaceElevated: '#EFF2EF',
  
  text: '#1A2A1A',
  textSecondary: '#3A4A3A',
  textMuted: '#7A8A7A',
  
  primary: '#5C7A5C', // Forest green
  primaryMuted: '#D4E0D4',
  secondary: '#8A7A5C', // Warm brown
  
  success: '#5C7A5C',
  warning: '#B5A060',
  error: '#A05050',
  info: '#506080',
  
  border: '#D8E0D8',
  borderLight: '#E8EDE8',
  divider: '#E0E5E0',
  
  buttonPrimary: '#5C7A5C',
  buttonSecondary: '#E8EDE8',
  inputBackground: '#F8FAF8',
};

// Ocean (calming blue)
export const THEME_OCEAN: ColorPalette = {
  background: '#F5F8FA',
  surface: '#FFFFFF',
  surfaceElevated: '#EFF4F7',
  
  text: '#1A1F2A',
  textSecondary: '#3A4555',
  textMuted: '#7A8595',
  
  primary: '#5A7A9A', // Ocean blue
  primaryMuted: '#D4E0EC',
  secondary: '#7A9A8A', // Sea foam
  
  success: '#5A9A7A',
  warning: '#B5A060',
  error: '#9A5A5A',
  info: '#5A7A9A',
  
  border: '#D8E2EA',
  borderLight: '#E8F0F5',
  divider: '#E0E8EE',
  
  buttonPrimary: '#5A7A9A',
  buttonSecondary: '#E8F0F5',
  inputBackground: '#F8FAFB',
};

// All themes
export const THEMES: Record<ThemeMode, ColorPalette> = {
  light: THEME_WARM_STUDIO,
  dark: THEME_DARK_STUDIO,
  warm: THEME_WARM_STUDIO,
  forest: THEME_FOREST,
  ocean: THEME_OCEAN,
};

// Theme metadata for UI
export const THEME_INFO: Record<ThemeMode, { name: string; emoji: string; description: string }> = {
  light: { name: 'Studio Caldo', emoji: '☀️', description: 'Toni caldi e rilassanti' },
  dark: { name: 'Studio Scuro', emoji: '🌙', description: 'Elegante e riposante' },
  warm: { name: 'Studio Caldo', emoji: '🌅', description: 'Toni caldi e rilassanti' },
  forest: { name: 'Foresta', emoji: '🌲', description: 'Verde naturale e calmo' },
  ocean: { name: 'Oceano', emoji: '🌊', description: 'Blu profondo e sereno' },
};

// Default
export const DEFAULT_THEME: ThemeMode = 'warm';
