import { VALID_WALLETWALLET_COLOR_PRESETS } from '@/lib/wallet/provider/types';

const PRESET_HEX_FALLBACKS: Record<string, string> = {
  dark: '#14161a',
  light: '#f4f5f7',
  blue: '#1f2947',
  green: '#1d5b40',
  red: '#8a2531',
  purple: '#5f3c82',
  orange: '#a85a1f',
};

function sanitizeHex(value: unknown) {
  const input = typeof value === 'string' ? value.trim() : '';
  const normalized = input.startsWith('#') ? input : `#${input}`;
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized.toUpperCase() : '';
}

function hexToRgb(hex: string) {
  const normalized = sanitizeHex(hex);
  if (!normalized) {
    return null;
  }

  const value = normalized.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness };
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  return { h: hue * 60, s: saturation, l: lightness };
}

export function mapHexToWalletWalletPreset(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return 'blue';
  }

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (l <= 0.18) {
    return 'dark';
  }

  if (l >= 0.78 && s <= 0.22) {
    return 'light';
  }

  if (s <= 0.12) {
    return l < 0.45 ? 'dark' : 'light';
  }

  if (h >= 200 && h <= 260) {
    return l < 0.28 ? 'dark' : 'blue';
  }

  if (h >= 85 && h <= 170) {
    return 'green';
  }

  if (h >= 345 || h < 20) {
    return 'red';
  }

  if (h >= 260 && h < 345) {
    return 'purple';
  }

  if (h >= 20 && h < 85) {
    return 'orange';
  }

  return 'blue';
}

export function getWalletWalletPresetHex(preset: string) {
  return PRESET_HEX_FALLBACKS[
    VALID_WALLETWALLET_COLOR_PRESETS.includes(
      preset as (typeof VALID_WALLETWALLET_COLOR_PRESETS)[number]
    )
      ? preset
      : 'blue'
  ];
}
