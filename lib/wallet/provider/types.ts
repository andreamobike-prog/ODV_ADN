export type WalletField = {
  label: string;
  value: string;
};

export type WalletWalletVisualConfig = {
  logoText: string;
  colorPreset: 'dark' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | string;
  barcodeFormat: 'QR';
  logoURL?: string;
  stripURL?: string;
  backgroundColor?: string;
  headerFields: WalletField[];
  primaryFields: WalletField[];
  secondaryFields: WalletField[];
  auxiliaryFields: WalletField[];
  backFields: WalletField[];
};

export type WalletWalletPayload = {
  barcodeValue: string;
  barcodeFormat: 'QR';
  logoText?: string;
  colorPreset?: string;
  logoURL?: string;
  stripURL?: string;
  backgroundColor?: string;
  headerFields?: WalletField[];
  primaryFields?: WalletField[];
  secondaryFields?: WalletField[];
  auxiliaryFields?: WalletField[];
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
  logoText: 'ANGELI DEI NAVIGLI',
  colorPreset: 'blue',
  barcodeFormat: 'QR',
  logoURL: '',
  stripURL: '',
  backgroundColor: '',
  headerFields: [],
  primaryFields: [],
  secondaryFields: [
    { label: 'SOCIO', value: '{{fullName}}' },
    { label: 'COD. SOCIO', value: '{{cardNumber}}' },
    { label: 'SCADENZA', value: '{{expiryDate}}' },
  ],
  auxiliaryFields: [],
  backFields: [
    { label: 'Nome', value: '{{fullName}}' },
    { label: 'TIPO', value: '{{roleLabel}}' },
    { label: 'EMAIL', value: '{{email}}' },
    { label: 'ID', value: '{{id}}' },
  ],
};

export {
  normalizeWalletWalletConfig,
  normalizeWalletWalletVisualConfig,
} from '@/lib/wallet/provider/normalizeWalletWalletConfig';
