'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase-server';

type Result<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type TesseraWalletContext = {
  tessera: any;
  socio: any | null;
  tesseraSettings: any | null;
};

async function recuperaTesseraDigitale(tesseraId: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from('tessere_digitali')
    .select('*')
    .eq('id', tesseraId)
    .single();

  if (error) {
    return { ok: false as const, error: error.message };
  }

  if (!data) {
    return { ok: false as const, error: 'Tessera digitale non trovata.' };
  }

  return { ok: true as const, data };
}

async function recuperaContestoWalletTessera(
  tesseraId: string
): Promise<Result<TesseraWalletContext>> {
  const supabase = await getSupabaseServerClient();

  const tesseraResult = await recuperaTesseraDigitale(tesseraId);

  if (!tesseraResult.ok) {
    return { ok: false, error: tesseraResult.error };
  }

  const tessera = tesseraResult.data;

  let socio: any | null = null;

  if (tessera.socio_id) {
    const { data: socioData, error: socioError } = await supabase
      .from('soci')
      .select('*')
      .eq('id', tessera.socio_id)
      .maybeSingle();

    if (socioError) {
      return { ok: false, error: socioError.message };
    }

    socio = socioData ?? null;
  }

  const { data: tesseraSettings, error: settingsError } = await supabase
    .from('tessera_settings')
    .select(`
      id,
      organizzazione_id,
      nome_associazione_tessera,
      titolo_tessera,
      etichetta_codice,
      etichetta_titolare,
      etichetta_scadenza,
      logo_url,
      immagine_centrale_url,
      colore_sfondo,
      colore_testo,
      colore_accento,
      formato_codice,
      prefisso_tessera,
      lunghezza_progressivo,
      qr_abilitato,
      qr_destinazione,
      qr_testo
    `)
    .eq('organizzazione_id', '11111111-1111-1111-1111-111111111111')
    .maybeSingle();

  if (settingsError) {
    return { ok: false, error: settingsError.message };
  }

  return {
    ok: true,
    data: {
      tessera,
      socio,
      tesseraSettings: tesseraSettings ?? null,
    },
  };
}

export async function segnaEmailTesseraInviataAction(payload: {
  tesseraId: string;
}): Promise<Result> {
  try {
    const tesseraResult = await recuperaTesseraDigitale(payload.tesseraId);

    if (!tesseraResult.ok) {
      return { ok: false, error: tesseraResult.error };
    }

    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('tessere_digitali')
      .update({
        email_inviata: true,
      })
      .eq('id', payload.tesseraId)
      .select()
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/tessere');
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante l’aggiornamento invio email tessera.',
    };
  }
}

export async function segnaWalletTesseraInviatoAction(payload: {
  tesseraId: string;
}): Promise<Result> {
  try {
    const contestoResult = await recuperaContestoWalletTessera(payload.tesseraId);

    if (!contestoResult.ok) {
      return { ok: false, error: contestoResult.error };
    }

    const { tessera, socio, tesseraSettings } = contestoResult.data;

    const nomeCompleto = [socio?.nome, socio?.cognome].filter(Boolean).join(' ').trim();
    const codiceTessera = tessera?.codice_tessera ?? '';
    const publicToken = tessera?.public_token ?? payload.tesseraId;

    const googleWalletUrl = `https://example.com/google-wallet/${encodeURIComponent(publicToken)}`;
    const appleWalletUrl = `https://example.com/apple-wallet/${encodeURIComponent(publicToken)}.pkpass`;

    const supabase = await getSupabaseServerClient();

    const updatePayload = {
  wallet_inviato: true,
  google_wallet_url: googleWalletUrl,
  apple_wallet_url: appleWalletUrl,
  wallet_ultimo_aggiornamento: new Date().toISOString(),
  wallet_ultimo_errore: null,
};

console.log('WALLET UPDATE tesseraId:', payload.tesseraId);
console.log('WALLET UPDATE payload:', updatePayload);

const { data, error } = await supabase
  .from('tessere_digitali')
  .update(updatePayload)
  .eq('id', payload.tesseraId)
  .select('*')
  .single();

console.log('WALLET UPDATE result data:', data);
console.log('WALLET UPDATE result error:', error);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/tessere');
    return {
      ok: true,
      data: {
        ...data,
        tessera_originale: tessera,
        socio,
        tessera_settings: tesseraSettings,
        wallet_preview: {
          nomeCompleto,
          codiceTessera,
          googleWalletUrl,
          appleWalletUrl,
        },
      },
    };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante l’aggiornamento wallet tessera.',
    };
  }
}