'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { GoogleAuth } from 'google-auth-library';

type Result<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function preparaTesseraDigitaleAction(payload: {
  socioId: string;
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: socio, error: socioError } = await supabase
      .from('soci')
      .select('id, codice_univoco, stato, archiviato')
      .eq('id', payload.socioId)
      .maybeSingle();

    if (socioError) {
      return { ok: false, error: socioError.message };
    }

    if (!socio) {
      return { ok: false, error: 'Socio non trovato.' };
    }

    if (socio.archiviato || socio.stato !== 'attivo') {
      return {
        ok: false,
        error: 'La tessera può essere preparata solo per soci attivi non archiviati.',
      };
    }

    const annoCorrente = new Date().getFullYear();

    const { data: tesseraEsistente, error: tesseraError } = await supabase
      .from('tessere_digitali')
      .select('id, public_token')
      .eq('socio_id', payload.socioId)
      .maybeSingle();

    if (tesseraError) {
      return { ok: false, error: tesseraError.message };
    }

    if (!tesseraEsistente) {
      const publicToken = randomUUID().replace(/-/g, '');

      const { data, error } = await supabase
        .from('tessere_digitali')
        .insert({
          socio_id: payload.socioId,
          codice_tessera: socio.codice_univoco,
          public_token: publicToken,
          wallet_inviato: false,
          email_inviata: false,
          stato: 'attiva',
          anno_validita: annoCorrente,
          scadenza_al: `${annoCorrente}-12-31`,
        })
        .select('*')
        .single();

      if (error) {
        return { ok: false, error: error.message };
      }

      console.log('TESSERA_OK', data);
      revalidatePath('/tessere');
      return { ok: true, data };
    }

    const { data, error } = await supabase
      .from('tessere_digitali')
      .update({
        codice_tessera: socio.codice_univoco,
        stato: 'attiva',
        wallet_inviato: false,
        email_inviata: false,
      })
      .eq('id', tesseraEsistente.id)
      .select('*')
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }
    console.log('TESSERA_OK', data);
    revalidatePath('/tessere');

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante la preparazione della tessera digitale.',
    };
  }
}

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

async function recuperaContestoWalletTessera(tesseraId: string): Promise<Result<{
  tessera: any;
  socio: any | null;
  tesseraSettings: any | null;
}>> {
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

function getGoogleWalletEnv() {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const classId = process.env.GOOGLE_WALLET_CLASS_ID;
  const clientEmail = process.env.GOOGLE_WALLET_CLIENT_EMAIL;
  const privateKeyId = process.env.GOOGLE_WALLET_PRIVATE_KEY_ID;
  const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!issuerId) {
    throw new Error('Variabile GOOGLE_WALLET_ISSUER_ID mancante.');
  }

  if (!classId) {
    throw new Error('Variabile GOOGLE_WALLET_CLASS_ID mancante.');
  }

  if (!clientEmail) {
    throw new Error('Variabile GOOGLE_WALLET_CLIENT_EMAIL mancante.');
  }

  if (!privateKeyId) {
    throw new Error('Variabile GOOGLE_WALLET_PRIVATE_KEY_ID mancante.');
  }

  if (!privateKey) {
    throw new Error('Variabile GOOGLE_WALLET_PRIVATE_KEY mancante.');
  }

  return {
    issuerId,
    classId,
    clientEmail,
    privateKeyId,
    privateKey,
  };
}

async function buildGoogleWalletUrl(input: {
  tessera: any;
  socio: any | null;
  tesseraSettings: any | null;
}) {
  const { issuerId, classId, clientEmail, privateKey, privateKeyId } =
    getGoogleWalletEnv();

  const objectSuffix = randomUUID();

  const objectId = `${issuerId}.${String(objectSuffix)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')}`;

  const fullClassId = `${issuerId}.${classId}`;

  const titoloTessera =
    input.tesseraSettings?.titolo_tessera || 'Tessera associativa';

  const nomeCompleto = [input.socio?.nome, input.socio?.cognome]
    .filter(Boolean)
    .join(' ')
    .trim();

  const walletObject = {
    id: objectId,
    classId: fullClassId,
    state: 'ACTIVE',
    cardTitle: {
      defaultValue: {
        language: 'it-IT',
        value: titoloTessera,
      },
    },
    header: {
      defaultValue: {
        language: 'it-IT',
        value: nomeCompleto || input.tessera.codice_tessera || 'Socio',
      },
    },
    subheader: {
      defaultValue: {
        language: 'it-IT',
        value:
          input.tesseraSettings?.nome_associazione_tessera ||
          'Angeli dei Navigli ODV ETS',
      },
    },
    barcode: {
      type: 'QR_CODE',
      value:
        input.tessera.public_token ||
        input.tessera.codice_tessera ||
        input.tessera.id,
      alternateText: input.tessera.codice_tessera || '',
    },
    textModulesData: [
      {
        id: 'codice',
        header: 'Codice',
        body: input.tessera.codice_tessera || 'N/D',
      },
    ],
  };

  const auth = new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
      private_key_id: privateKeyId,
    },
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  });

  const authClient = await auth.getClient();
  const accessTokenResponse = await authClient.getAccessToken();
  const accessToken =
    typeof accessTokenResponse === 'string'
      ? accessTokenResponse
      : accessTokenResponse?.token;

  if (!accessToken) {
    throw new Error('Impossibile ottenere access token Google Wallet.');
  }

  const insertResponse = await fetch(
    'https://walletobjects.googleapis.com/walletobjects/v1/genericObject',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walletObject),
      cache: 'no-store',
    }
  );

  const insertJson = await insertResponse.json().catch(() => null);

  console.log('GOOGLE WALLET insert status:', insertResponse.status);
  console.log('GOOGLE WALLET insert body:', insertJson);

  if (!insertResponse.ok) {
    throw new Error(
      `Google Wallet insert error (${insertResponse.status}): ${JSON.stringify(insertJson)}`
    );
  }

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';

  const appOrigin = new URL(appBaseUrl).origin;

  const payload = {
    iss: clientEmail,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [appOrigin],
    payload: {
      genericObjects: [walletObject],
    },
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    keyid: privateKeyId,
  });

  return `https://pay.google.com/gp/v/save/${token}`;
}

export async function segnaEmailTesseraInviataAction(payload: {
  tesseraId: string;
}): Promise<Result> {
  try {
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

    const supabase = await getSupabaseServerClient();

    let googleWalletUrl: string | null = null;
    let walletError: string | null = null;

    try {
      googleWalletUrl = await buildGoogleWalletUrl({
        tessera,
        socio,
        tesseraSettings,
      });
    } catch (e) {
      walletError =
        e instanceof Error
          ? e.message
          : 'Errore durante la generazione Google Wallet.';
    }

    const { data, error } = await supabase
      .from('tessere_digitali')
      .update({
        wallet_inviato: Boolean(googleWalletUrl),
        google_wallet_url: googleWalletUrl,
        apple_wallet_url: null,
        wallet_ultimo_aggiornamento: new Date().toISOString(),
        wallet_ultimo_errore: walletError,
      })
      .eq('id', payload.tesseraId)
      .select('*')
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/tessere');

    if (walletError) {
      return { ok: false, error: walletError };
    }

    return {
      ok: true,
      data: {
        ...data,
        tessera_originale: tessera,
        socio,
        tessera_settings: tesseraSettings,
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