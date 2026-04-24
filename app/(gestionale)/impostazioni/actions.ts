'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import {
  normalizeWalletWalletVisualConfig,
  toWalletWalletStoredConfig,
} from '@/lib/wallet/provider/normalizeWalletWalletConfig';
import type { WalletWalletVisualConfig } from '@/lib/wallet/provider/types';

type Result<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const ORGANIZZAZIONE_ID = '11111111-1111-1111-1111-111111111111';
const BUCKET_NAME = 'branding-assets';

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function uploadTesseraAssetAction(payload: {
  tipo: 'logo' | 'immagine_centrale';
  file: File;
}): Promise<Result<{ publicUrl: string }>> {
  try {
    const supabase = await getSupabaseServerClient();

    if (!payload.file || payload.file.size === 0) {
      return { ok: false, error: 'Nessun file selezionato.' };
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(payload.file.type)) {
      return {
        ok: false,
        error: 'Formato non supportato. Usa PNG, JPG, WEBP o SVG.',
      };
    }

    const bytes = await payload.file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = sanitizeFileName(payload.file.name || `${payload.tipo}.png`);
    const filePath = `${ORGANIZZAZIONE_ID}/tessera/${payload.tipo}-${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: payload.file.type,
        upsert: true,
      });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;

    const updateField =
      payload.tipo === 'logo' ? { logo_url: publicUrl } : { immagine_centrale_url: publicUrl };

    const { error: updateError } = await supabase
      .from('tessera_settings')
      .update(updateField)
      .eq('organizzazione_id', ORGANIZZAZIONE_ID);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    revalidatePath('/impostazioni');
    revalidatePath('/tessere');

    return { ok: true, data: { publicUrl } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Errore durante il caricamento file.',
    };
  }
}

export async function salvaImpostazioniAction(payload: {
  nomeAssociazione: string;
  sottotitoloAssociazione: string;
  logoGestionaleUrl?: string | null;
  codiceFiscale: string;
  partitaIva: string;
  runtsNumero: string;
  runtsSezione: string;
  runtsDataIscrizione: string;
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  email: string;
  pec: string;
  telefono: string;
  sitoWeb: string;
  iban: string;
  intestatarioConto: string;
  presidenteNome: string;
  testoRicevuta: string;
  ricevutaTestoIntro: string;
  ricevutaTestoAttestazione: string;
  ricevutaTestoNonCorrispettivo: string;
  ricevutaTestoNotaFinale: string;
  bolloAttivo: boolean;
  bolloImporto: number;
  walletConfig: WalletWalletVisualConfig;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await getSupabaseServerClient();
    const organizzazioneId = '11111111-1111-1111-1111-111111111111';
    const walletConfig = normalizeWalletWalletVisualConfig(payload.walletConfig);
    const walletStoredConfig = toWalletWalletStoredConfig(walletConfig);

    const { error: orgError } = await supabase
      .from('organizzazione_settings')
      .upsert(
        {
          organizzazione_id: organizzazioneId,
          nome_associazione: payload.nomeAssociazione.trim(),
          sottotitolo_associazione: payload.sottotitoloAssociazione.trim() || null,
          logo_gestionale_url: payload.logoGestionaleUrl?.trim() || null,
          codice_fiscale: payload.codiceFiscale.trim() || null,
          partita_iva: payload.partitaIva.trim() || null,
          runts_numero: payload.runtsNumero.trim() || null,
          runts_sezione: payload.runtsSezione.trim() || null,
          runts_data_iscrizione: payload.runtsDataIscrizione.trim() || null,
          indirizzo: payload.indirizzo.trim() || null,
          cap: payload.cap.trim() || null,
          comune: payload.comune.trim() || null,
          provincia: payload.provincia.trim() || null,
          email: payload.email.trim() || null,
          pec: payload.pec.trim() || null,
          telefono: payload.telefono.trim() || null,
          sito_web: payload.sitoWeb.trim() || null,
          iban: payload.iban.trim() || null,
          intestatario_conto: payload.intestatarioConto.trim() || null,
          presidente_nome: payload.presidenteNome.trim() || null,
          testo_ricevuta: payload.testoRicevuta.trim() || null,
          ricevuta_testo_intro: payload.ricevutaTestoIntro.trim() || null,
          ricevuta_testo_attestazione: payload.ricevutaTestoAttestazione.trim() || null,
          ricevuta_testo_non_corrispettivo:
            payload.ricevutaTestoNonCorrispettivo.trim() || null,
          ricevuta_testo_nota_finale: payload.ricevutaTestoNotaFinale.trim() || null,
          bollo_attivo: payload.bolloAttivo,
          bollo_importo: payload.bolloImporto,
        },
        { onConflict: 'organizzazione_id' }
      );

    if (orgError) {
      return { ok: false, error: orgError.message };
    }

    const { error: tesseraError } = await supabase
      .from('tessera_settings')
      .upsert(
        {
          organizzazione_id: organizzazioneId,
          walletwallet_visual_config: walletStoredConfig,
        },
        { onConflict: 'organizzazione_id' }
      );

    if (tesseraError) {
      return { ok: false, error: tesseraError.message };
    }

    revalidatePath('/impostazioni');
    revalidatePath('/');
    revalidatePath('/tessere');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Errore durante il salvataggio.',
    };
  }
}

export async function uploadLogoGestionaleAction(payload: {
  file: File;
}): Promise<
  | { ok: true; data: { publicUrl: string; path: string } }
  | { ok: false; error: string }
> {
  try {
    const supabase = await getSupabaseServerClient();
    const organizzazioneId = '11111111-1111-1111-1111-111111111111';
    const bucketName = 'branding-assets';

    const arrayBuffer = await payload.file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = payload.file.name.split('.').pop()?.toLowerCase() || 'png';
    const filePath = `${organizzazioneId}/gestionale/logo-gestionale-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: payload.file.type || 'image/png',
        upsert: true,
      });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;

    const { error: updateError } = await supabase
      .from('organizzazione_settings')
      .upsert(
        {
          organizzazione_id: organizzazioneId,
          logo_gestionale_url: publicUrl,
        },
        { onConflict: 'organizzazione_id' }
      );

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    revalidatePath('/impostazioni');
    revalidatePath('/');

    return {
      ok: true,
      data: {
        publicUrl,
        path: filePath,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Errore upload logo gestionale.',
    };
  }
}
