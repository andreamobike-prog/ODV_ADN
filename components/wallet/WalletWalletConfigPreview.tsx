'use client';

import { WalletWalletPassPreview } from '@/components/wallet/WalletWalletPassPreview';
import { buildProviderPassPayload } from '@/lib/wallet/provider/buildProviderPassPayload';
import { resolveWalletWalletAssets } from '@/lib/wallet/provider/resolveWalletWalletAssets';
import type { WalletWalletVisualConfig } from '@/lib/wallet/provider/types';
import type { WalletSubject } from '@/lib/wallet/types';

type Props = {
  config: WalletWalletVisualConfig;
  sampleSubject?: WalletSubject;
};

const DEFAULT_SAMPLE_SUBJECT: WalletSubject = {
  id: 'preview-001',
  type: 'member',
  fullName: 'Sonia Mangione',
  email: 'sonia@example.org',
  cardNumber: 'SOC-2026-001',
  roleLabel: 'Socio',
  qrValue: 'member:preview-001',
  expiryDate: '2026-12-31',
  associationName: 'Angeli dei Navigli ODV',
};

export function WalletWalletConfigPreview({
  config,
  sampleSubject = DEFAULT_SAMPLE_SUBJECT,
}: Props) {
  const payload = buildProviderPassPayload(sampleSubject, config);
  const assets = resolveWalletWalletAssets(config);

  return (
    <WalletWalletPassPreview
      logoText={payload.logoText || config.logoText}
      colorPreset={payload.colorPreset || config.colorPreset}
      logoURL={payload.logoURL}
      stripURL={payload.stripURL}
      backgroundColor={payload.backgroundColor}
      headerFields={payload.headerFields ?? []}
      secondaryFields={payload.secondaryFields ?? []}
      backFields={payload.backFields ?? []}
      barcodeValue={payload.barcodeValue}
      assetWarnings={assets.warnings}
    />
  );
}
