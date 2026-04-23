import { VALID_WALLETWALLET_COLOR_PRESETS } from '@/lib/wallet/provider/types';

export type WalletWalletPreviewTheme = {
  background: string;
  foreground: string;
  mutedText: string;
  border: string;
};

const PREVIEW_THEMES: Record<string, WalletWalletPreviewTheme> = {
  dark: {
    background: '#14161a',
    foreground: '#f5f7fb',
    mutedText: '#aab2bf',
    border: 'rgba(255,255,255,0.12)',
  },
  light: {
    background: '#f4f5f7',
    foreground: '#14161a',
    mutedText: '#5c6675',
    border: 'rgba(20,22,26,0.12)',
  },
  blue: {
    background: '#133d78',
    foreground: '#f4f8ff',
    mutedText: '#c7daf8',
    border: 'rgba(255,255,255,0.14)',
  },
  green: {
    background: '#174b34',
    foreground: '#f3fbf5',
    mutedText: '#c6e8d3',
    border: 'rgba(255,255,255,0.14)',
  },
  red: {
    background: '#7b1f2a',
    foreground: '#fff5f5',
    mutedText: '#f3c6cc',
    border: 'rgba(255,255,255,0.14)',
  },
  purple: {
    background: '#56317a',
    foreground: '#faf6ff',
    mutedText: '#e4d5f5',
    border: 'rgba(255,255,255,0.14)',
  },
  orange: {
    background: '#8a4b18',
    foreground: '#fff8f2',
    mutedText: '#f2d1b2',
    border: 'rgba(255,255,255,0.14)',
  },
};

export const WALLETWALLET_PREVIEW_COLOR_PRESETS = [...VALID_WALLETWALLET_COLOR_PRESETS];

export function getWalletWalletPreviewTheme(colorPreset: string): WalletWalletPreviewTheme {
  return PREVIEW_THEMES[colorPreset] ?? PREVIEW_THEMES.dark;
}
