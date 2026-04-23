export type WalletField = {
  label: string;
  value: string;
};

export type WalletWalletVisualConfig = {
  logoText: string;
  colorPreset: 'dark' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | string;
  barcodeFormat: 'QR';
  headerFields: WalletField[];
  primaryFields: WalletField[];
  secondaryFields: WalletField[];
  backFields: WalletField[];
};

export type WalletWalletPayload = {
  barcodeValue: string;
  barcodeFormat: 'QR';
  logoText?: string;
  colorPreset?: string;
  headerFields?: WalletField[];
  primaryFields?: WalletField[];
  secondaryFields?: WalletField[];
  backFields?: WalletField[];
};

export const WALLETWALLET_FIELD_LIMITS = {
  headerFields: 2,
  primaryFields: 1,
  secondaryFields: 4,
  backFields: 8,
} as const;

export const VALID_WALLETWALLET_COLOR_PRESETS = [
  'dark',
  'blue',
  'green',
  'red',
  'purple',
  'orange',
] as const;

export const DEFAULT_WALLETWALLET_VISUAL_CONFIG: WalletWalletVisualConfig = {
  logoText: 'Angeli dei Navigli ODV',
  colorPreset: 'dark',
  barcodeFormat: 'QR',
  headerFields: [],
  primaryFields: [{ label: 'TESSERA', value: '{{roleLabel}} 2026' }],
  secondaryFields: [
    { label: 'NOME', value: '{{fullName}}' },
    { label: 'CODICE', value: '{{cardNumber}}' },
    { label: 'SCADENZA', value: '{{expiryDate}}' },
  ],
  backFields: [
    { label: 'EMAIL', value: '{{email}}' },
    { label: 'ID', value: '{{id}}' },
  ],
};

export {
  normalizeWalletWalletConfig,
  normalizeWalletWalletVisualConfig,
} from '@/lib/wallet/provider/normalizeWalletWalletConfig';
