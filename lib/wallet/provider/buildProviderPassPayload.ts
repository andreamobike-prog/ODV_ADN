import type { WalletSubject } from '@/lib/wallet/types';
import { normalizeWalletWalletConfig } from '@/lib/wallet/provider/normalizeWalletWalletConfig';
import { mapHexToWalletWalletPreset } from '@/lib/wallet/provider/mapHexToWalletWalletPreset';
import { resolveWalletWalletAssets } from '@/lib/wallet/provider/resolveWalletWalletAssets';
import type { WalletWalletPayload, WalletWalletVisualConfig } from '@/lib/wallet/provider/types';

export function buildProviderPassPayload(
  subject: WalletSubject,
  config: WalletWalletVisualConfig
): WalletWalletPayload {
  const normalizedConfig = normalizeWalletWalletConfig(config);
  const assets = resolveWalletWalletAssets(normalizedConfig);
  const expiryDate = subject.expiryDate ?? '';
  const backgroundColor = assets.backgroundColor || normalizedConfig.backgroundColor;
  const colorPreset = mapHexToWalletWalletPreset(backgroundColor || '');

  return {
    barcodeValue: subject.cardNumber?.trim() || subject.qrValue?.trim() || subject.id,
    barcodeFormat: 'QR',
    logoText: normalizedConfig.logoText,
    colorPreset,
    logoURL: assets.logoURL,
    stripURL: assets.stripURL,
    backgroundColor,
    foregroundColor: '#FFFFFF',
    labelColor: '#D6D6D6',
    primaryFields: [],
    secondaryFields: [
      { label: 'SOCIO', value: subject.fullName ?? '' },
      { label: 'CODICE', value: subject.cardNumber ?? '' },
      { label: 'SCADENZA', value: expiryDate },
    ],
    auxiliaryFields: [],
    backFields: [
      { label: 'NOME', value: subject.fullName ?? '' },
      { label: 'EMAIL', value: subject.email ?? '' },
      { label: 'ID', value: subject.id ?? '' },
    ],
  };
}
