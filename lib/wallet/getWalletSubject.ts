import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { WalletEntityType, WalletSubject } from '@/lib/wallet/types';

export class WalletSubjectNotFoundError extends Error {
  constructor() {
    super('Record non trovato.');
    this.name = 'WalletSubjectNotFoundError';
  }
}

function buildCardNumber(type: WalletEntityType, id: string) {
  const normalizedId = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const prefix = type === 'member' ? 'SOC' : 'VOL';
  return `${prefix}-${normalizedId.slice(0, 12) || id.toUpperCase()}`;
}

function buildFullName(nome: string | null, cognome: string | null) {
  return [nome, cognome].filter(Boolean).join(' ').trim();
}

export async function getWalletSubject(
  type: WalletEntityType,
  id: string
): Promise<WalletSubject> {
  const supabase = await getSupabaseServerClient();

  const table = type === 'member' ? 'soci' : 'volontari';
  const { data, error } = await supabase
    .from(table)
    .select('id,codice_univoco,nome,cognome,email')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new WalletSubjectNotFoundError();
  }

  const fullName = buildFullName(data.nome, data.cognome);
  const roleLabel = type === 'member' ? 'Socio' : 'Volontario';

  return {
    id: data.id,
    type,
    fullName: fullName || roleLabel,
    email: data.email ?? null,
    cardNumber: data.codice_univoco || buildCardNumber(type, data.id),
    roleLabel,
    qrValue: `${type}:${data.id}`,
  };
}
