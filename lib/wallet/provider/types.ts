export type WalletField = {
  label: string;
  value: string;
};

export type WalletWalletVisualConfig = {
  logoText: string;
  colorPreset: 'dark' | 'light' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | string;
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
  foregroundColor?: string;
  labelColor?: string;
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
  'light',
  'blue',
  'green',
  'red',
  'purple',
  'orange',
] as const;

export const DEFAULT_WALLETWALLET_VISUAL_CONFIG: WalletWalletVisualConfig = {
  logoText: 'Angeli dei Navigli ODV',
  colorPreset: 'blue',
  barcodeFormat: 'QR',
  logoURL: '',
  stripURL: '',
  backgroundColor: '#1f2947',
  headerFields: [],
  primaryFields: [],
  secondaryFields: [],
  auxiliaryFields: [],
  backFields: [],
};

export {
  normalizeWalletWalletConfig,
  normalizeWalletWalletVisualConfig,
} from '@/lib/wallet/provider/normalizeWalletWalletConfig';
