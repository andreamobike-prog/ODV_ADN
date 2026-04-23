import type { WalletSubject } from '@/lib/wallet/types';
import { normalizeWalletWalletConfig } from '@/lib/wallet/provider/normalizeWalletWalletConfig';
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
    cardNumber: subject.cardNumber ?? '',
    roleLabel: subject.roleLabel ?? '',
    email: subject.email ?? '',
    id: subject.id ?? '',
    expiryDate: subject.expiryDate ?? '',
    associationName: subject.associationName ?? normalizedConfig.logoText ?? '',
  };

  return {
    barcodeValue: subject.cardNumber?.trim() || subject.qrValue?.trim() || subject.id,
    barcodeFormat: 'QR',
    logoText: normalizedConfig.logoText,
    colorPreset: normalizedConfig.colorPreset,
    headerFields: resolveFields(normalizedConfig.headerFields, replacements),
    primaryFields: resolveFields(normalizedConfig.primaryFields, replacements),
    secondaryFields: resolveFields(normalizedConfig.secondaryFields, replacements),
    backFields: resolveFields(normalizedConfig.backFields, replacements),
  };
}
