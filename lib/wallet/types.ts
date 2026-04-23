export type WalletEntityType = 'member' | 'volunteer';

export interface WalletSubject {
  id: string;
  type: WalletEntityType;
  fullName: string;
  email?: string | null;
  cardNumber: string;
  roleLabel: string;
  qrValue: string;
  expiryDate?: string | null;
  associationName?: string | null;
}

export function isWalletEntityType(value: string): value is WalletEntityType {
  return value === 'member' || value === 'volunteer';
}
