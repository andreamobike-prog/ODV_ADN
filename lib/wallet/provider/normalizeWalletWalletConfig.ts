import {
  DEFAULT_WALLETWALLET_VISUAL_CONFIG,
  type WalletWalletVisualConfig,
} from '@/lib/wallet/provider/types';
import {
  getWalletWalletPresetHex,
  mapHexToWalletWalletPreset,
} from '@/lib/wallet/provider/mapHexToWalletWalletPreset';

function sanitizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeHexColor(value: unknown) {
  const input = sanitizeString(value);
  if (!input) {
    return '';
  }

  const normalized = input.startsWith('#') ? input : `#${input}`;
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized.toUpperCase() : '';
}

export function toWalletWalletStoredConfig(
  value: unknown
): Pick<WalletWalletVisualConfig, 'logoText' | 'backgroundColor' | 'logoURL' | 'stripURL'> {
  const normalized = normalizeWalletWalletConfig(value);

  return {
    logoText: normalized.logoText,
    backgroundColor: normalized.backgroundColor || DEFAULT_WALLETWALLET_VISUAL_CONFIG.backgroundColor,
    logoURL: normalized.logoURL || '',
    stripURL: normalized.stripURL || '',
  };
}

export function normalizeWalletWalletConfig(value: unknown): WalletWalletVisualConfig {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const logoText = sanitizeString(input.logoText);
  const resolvedLogoText = logoText || DEFAULT_WALLETWALLET_VISUAL_CONFIG.logoText;
  const backgroundColor =
    sanitizeHexColor(input.backgroundColor) ||
    getWalletWalletPresetHex(sanitizeString(input.colorPreset)) ||
    DEFAULT_WALLETWALLET_VISUAL_CONFIG.backgroundColor ||
    '#1F2947';
  const colorPreset = mapHexToWalletWalletPreset(backgroundColor);

  return {
    logoText: resolvedLogoText,
    colorPreset,
    barcodeFormat: 'QR',
    logoURL: sanitizeString(input.logoURL),
    stripURL: sanitizeString(input.stripURL),
    backgroundColor,
    headerFields: [],
    primaryFields: [],
    secondaryFields: [],
    auxiliaryFields: [],
    backFields: [],
  };
}

export function normalizeWalletWalletVisualConfig(value: unknown): WalletWalletVisualConfig {
  return normalizeWalletWalletConfig(value);
}
