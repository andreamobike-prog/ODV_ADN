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

  const query =
    type === 'member'
      ? supabase
          .from('soci')
          .select('id,organizzazione_id,codice_univoco,nome,cognome,email')
          .eq('id', id)
          .maybeSingle()
      : supabase
          .from('volontari')
          .select('id,organizzazione_id,socio_id,codice_univoco,nome,cognome,email')
          .eq('id', id)
          .maybeSingle();

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new WalletSubjectNotFoundError();
  }

  const fullName = buildFullName(data.nome, data.cognome);
  const roleLabel = type === 'member' ? 'Socio' : 'Volontario';
  const socioId =
    type === 'member' ? data.id : ('socio_id' in data ? data.socio_id ?? null : null);

  const [{ data: tesseraDigitale, error: tesseraError }, { data: organizzazione, error: orgError }] =
    await Promise.all([
      socioId
        ? supabase
            .from('tessere_digitali')
            .select('scadenza_al,anno_validita')
            .eq('socio_id', socioId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from('organizzazione_settings')
        .select('nome_associazione')
        .eq('organizzazione_id', data.organizzazione_id)
        .maybeSingle(),
    ]);

  if (tesseraError) {
    throw new Error(tesseraError.message);
  }

  if (orgError) {
    throw new Error(orgError.message);
  }

  const expiryDate =
    tesseraDigitale?.scadenza_al ??
    (tesseraDigitale?.anno_validita ? `${tesseraDigitale.anno_validita}-12-31` : null);

  return {
    id: data.id,
    type,
    fullName: fullName || roleLabel,
    email: data.email ?? null,
    cardNumber: data.codice_univoco || buildCardNumber(type, data.id),
    roleLabel,
    qrValue: `${type}:${data.id}`,
    expiryDate,
    associationName: organizzazione?.nome_associazione ?? null,
  };
}
