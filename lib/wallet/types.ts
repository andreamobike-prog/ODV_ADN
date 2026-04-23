export type WalletEntityType = 'member' | 'volunteer';

export interface WalletSubject {
  id: string;
  type: WalletEntityType;
  fullName: string;
  email?: string | null;
  cardNumber: string;
  roleLabel: string;
  qrValue: string;
}

export function isWalletEntityType(value: string): value is WalletEntityType {
  return value === 'member' || value === 'volunteer';
}
