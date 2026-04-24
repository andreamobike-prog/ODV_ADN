import type { WalletSubject } from '@/lib/wallet/types';
import { normalizeWalletWalletConfig } from '@/lib/wallet/provider/normalizeWalletWalletConfig';
import { resolveWalletWalletAssets } from '@/lib/wallet/provider/resolveWalletWalletAssets';
import type {
  WalletField,
  WalletWalletPayload,
  WalletWalletVisualConfig,
} from '@/lib/wallet/provider/types';

const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9]+)\s*\}\}/g;

function replacePlaceholders(template: string, values: Record<string, string>) {
  return template.replace(PLACEHOLDER_PATTERN, (_match, key) => values[key] ?? '').trim();
}

function resolveFields(
  templates: WalletField[],
  values: Record<string, string>
): WalletField[] | undefined {
  const resolved = templates
    .map((field) => ({
      label: replacePlaceholders(field.label, values),
      value: replacePlaceholders(field.value, values),
    }))
    .filter((field) => field.label && field.value);

  return resolved.length > 0 ? resolved : undefined;
}

export function buildProviderPassPayload(
  subject: WalletSubject,
  config: WalletWalletVisualConfig
): WalletWalletPayload {
  const normalizedConfig = normalizeWalletWalletConfig(config);
  const replacements = {
    fullName: subject.fullName ?? '',
    fullNameUpper: subject.fullName?.toUpperCase() ?? '',
    cardNumber: subject.cardNumber ?? '',
    roleLabel: subject.roleLabel ?? '',
    email: subject.email ?? '',
    id: subject.id ?? '',
    expiryDate: subject.expiryDate ?? '',
    associationName: subject.associationName ?? normalizedConfig.logoText ?? '',
  };
  const assets = resolveWalletWalletAssets(normalizedConfig);
  const stripLayoutActive = Boolean(assets.stripURL || normalizedConfig.stripURL?.trim());

  const headerFields = resolveFields(normalizedConfig.headerFields, replacements);
  const secondaryFields = resolveFields(normalizedConfig.secondaryFields, replacements);
  const backFields = resolveFields(normalizedConfig.backFields, replacements);
  const primaryFields = stripLayoutActive
    ? undefined
    : resolveFields(normalizedConfig.primaryFields, replacements);

  return {
    barcodeValue: subject.cardNumber?.trim() || subject.qrValue?.trim() || subject.id,
    barcodeFormat: 'QR',
    logoText: normalizedConfig.logoText,
    colorPreset: normalizedConfig.colorPreset,
    logoURL: assets.logoURL,
    stripURL: assets.stripURL,
    backgroundColor: assets.backgroundColor,
    headerFields,
    ...(primaryFields ? { primaryFields } : {}),
    secondaryFields,
    auxiliaryFields: [],
    backFields,
  };
}
