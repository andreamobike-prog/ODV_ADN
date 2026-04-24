import {
  DEFAULT_WALLETWALLET_VISUAL_CONFIG,
  VALID_WALLETWALLET_COLOR_PRESETS,
  WALLETWALLET_FIELD_LIMITS,
  type WalletField,
  type WalletWalletVisualConfig,
} from '@/lib/wallet/provider/types';

function sanitizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeField(value: unknown): WalletField | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<WalletField>;
  const label = sanitizeString(candidate.label);
  const fieldValue = sanitizeString(candidate.value);

  if (!label || !fieldValue) {
    return null;
  }

  return { label, value: fieldValue };
}

function sanitizeFieldList(fields: unknown) {
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields.map(sanitizeField).filter((field): field is WalletField => field !== null);
}

function warnInDevelopment(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(message);
  }
}

export function normalizeWalletWalletConfig(value: unknown): WalletWalletVisualConfig {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  const rawPrimaryFields = sanitizeFieldList(input.primaryFields);
  const rawSecondaryFields = sanitizeFieldList(input.secondaryFields);
  const rawHeaderFields = sanitizeFieldList(input.headerFields);
  const legacyAuxiliaryFields = sanitizeFieldList(input.auxiliaryFields);
  const rawBackFields = sanitizeFieldList(input.backFields);
  const stripURL = sanitizeString(input.stripURL);
  const stripLayoutActive = Boolean(stripURL);

  const primaryField = rawPrimaryFields[0] ?? null;
  const extraPrimaryFields = rawPrimaryFields.slice(1);

  if (extraPrimaryFields.length > 0) {
    warnInDevelopment(
      'WalletWallet: more than one primary field is not supported cleanly; extra fields moved to secondaryFields'
    );
  }

  if (stripLayoutActive && rawPrimaryFields.length > 0) {
    warnInDevelopment(
      'WalletWallet: primaryFields removed because stripURL is active to avoid overlay.'
    );
  }

  const secondaryFieldsSource = stripLayoutActive
    ? [primaryField, ...extraPrimaryFields, ...rawSecondaryFields, ...legacyAuxiliaryFields]
    : [...extraPrimaryFields, ...rawSecondaryFields, ...legacyAuxiliaryFields];

  const secondaryFields = secondaryFieldsSource
    .filter((field): field is WalletField => field !== null)
    .slice(0, WALLETWALLET_FIELD_LIMITS.secondaryFields);

  const primaryFields = stripLayoutActive ? [] : primaryField ? [primaryField] : [];

  const logoText = sanitizeString(input.logoText);
  const resolvedLogoText = logoText || DEFAULT_WALLETWALLET_VISUAL_CONFIG.logoText;

  const colorPresetCandidate = sanitizeString(input.colorPreset);
  const colorPreset = VALID_WALLETWALLET_COLOR_PRESETS.includes(
    colorPresetCandidate as (typeof VALID_WALLETWALLET_COLOR_PRESETS)[number]
  )
    ? colorPresetCandidate
    : DEFAULT_WALLETWALLET_VISUAL_CONFIG.colorPreset;

  return {
    logoText: resolvedLogoText,
    colorPreset,
    barcodeFormat: 'QR',
    logoURL: sanitizeString(input.logoURL),
    stripURL,
    backgroundColor: sanitizeString(input.backgroundColor),
    headerFields: rawHeaderFields.slice(0, WALLETWALLET_FIELD_LIMITS.headerFields),
    primaryFields:
      primaryFields.length > 0
        ? primaryFields.slice(0, WALLETWALLET_FIELD_LIMITS.primaryFields)
        : [],
    secondaryFields,
    auxiliaryFields: [],
    backFields: rawBackFields.slice(0, WALLETWALLET_FIELD_LIMITS.backFields),
  };
}

export function normalizeWalletWalletVisualConfig(value: unknown): WalletWalletVisualConfig {
  return normalizeWalletWalletConfig(value);
}
