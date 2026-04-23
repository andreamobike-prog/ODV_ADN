'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import * as nodemailer from 'nodemailer';

type Result<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const ORGANIZZAZIONE_ID = '11111111-1111-1111-1111-111111111111';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const mailTransport =
  smtpHost && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : null;

export async function createSocioAction(payload: {
  nome: string;
  cognome: string;
  data_nascita: string;
  luogo_nascita: string;
  provincia_nascita: string;
  codice_fiscale: string;
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  telefono?: string;
  email?: string;
  stato: string;
  data_iscrizione: string;
  e_anche_volontario: boolean;
  e_minorenne: boolean;
}): Promise<Result> {
  try {
    if (!payload.nome || !payload.cognome) {
      return { ok: false, error: 'Campi obbligatori mancanti.' };
    }

    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('soci')
      .insert({
        organizzazione_id: ORGANIZZAZIONE_ID,
        nome: payload.nome,
        cognome: payload.cognome,
        data_nascita: payload.data_nascita || null,
        luogo_nascita: payload.luogo_nascita || null,
        provincia_nascita: payload.provincia_nascita || null,
        codice_fiscale: payload.codice_fiscale || null,
        indirizzo: payload.indirizzo || null,
        cap: payload.cap || null,
        comune: payload.comune || null,
        provincia: payload.provincia || null,
        telefono: payload.telefono || null,
        email: payload.email || null,
        stato: 'sospeso',
        data_iscrizione: payload.data_iscrizione || new Date().toISOString().slice(0, 10),
        e_anche_volontario: payload.e_anche_volontario,
        e_minorenne: payload.e_minorenne,
        origine_inserimento: 'operatore',
      })
      .select()
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath('/soci');
    revalidatePath('/');

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante la creazione del socio.',
    };
  }
}

export async function updateSocioAction(payload: {
  socioId: string;
  nome: string;
  cognome: string;
  data_nascita: string;
  luogo_nascita: string;
  provincia_nascita: string;
  codice_fiscale: string;
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  telefono?: string;
  email?: string;
  e_anche_volontario: boolean;
  e_minorenne: boolean;
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: existing, error: existingError } = await supabase
      .from('soci')
      .select(`
        id,
        modifica_bloccata,
        stato,
        e_anche_volontario,
        telefono,
        email,
        indirizzo,
        cap,
        comune,
        provincia
      `)
      .eq('id', payload.socioId)
      .single();

    if (existingError) {
      return { ok: false, error: existingError.message };
    }

    if (existing?.modifica_bloccata) {
      return {
        ok: false,
        error: 'Questo socio è bloccato e non può essere modificato.',
      };
    }

    const telefonoNuovo = payload.telefono || null;
    const emailNuova = payload.email || null;
    const indirizzoNuovo = payload.indirizzo || null;
    const capNuovo = payload.cap || null;
    const comuneNuovo = payload.comune || null;
    const provinciaNuova = payload.provincia || null;

    const datiVariabiliModificati =
      (existing.telefono || null) !== telefonoNuovo ||
      (existing.email || null) !== emailNuova ||
      (existing.indirizzo || null) !== indirizzoNuovo ||
      (existing.cap || null) !== capNuovo ||
      (existing.comune || null) !== comuneNuovo ||
      (existing.provincia || null) !== provinciaNuova;

    const richiedeVerificaVolontario =
      !!existing.e_anche_volontario && datiVariabiliModificati;

    const { data, error } = await supabase
      .from('soci')
      .update({
        nome: payload.nome,
        cognome: payload.cognome,
        data_nascita: payload.data_nascita || null,
        luogo_nascita: payload.luogo_nascita || null,
        provincia_nascita: payload.provincia_nascita || null,
        codice_fiscale: payload.codice_fiscale || null,
        indirizzo: indirizzoNuovo,
        cap: capNuovo,
        comune: comuneNuovo,
        provincia: provinciaNuova,
        telefono: telefonoNuovo,
        email: emailNuova,
        e_anche_volontario: payload.e_anche_volontario,
        e_minorenne: payload.e_minorenne,
        stato: existing.stato,
        richiede_verifica_volontario: richiedeVerificaVolontario
          ? true
          : undefined,
      })
      .eq('id', payload.socioId)
      .select()
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath('/soci');
    revalidatePath(`/soci/${payload.socioId}`);

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante l’aggiornamento del socio.',
    };
  }
}

export async function saveConsensiSocioAction(payload: {
  socioId: string;
  consenso_prestato_da: string;
  consenso_at: string;
  privacy_accettata: boolean;
  statuto_accettato: boolean;
  trattamento_dati_associazione: boolean;
  consenso_minore_finalita_associazione: boolean;
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: existing } = await supabase
      .from('consensi_soci')
      .select('id')
      .eq('socio_id', payload.socioId)
      .maybeSingle();

    let result;
    if (existing?.id) {
      result = await supabase
        .from('consensi_soci')
        .update({
          consenso_prestato_da: payload.consenso_prestato_da || null,
          consenso_at: payload.consenso_at || null,
          privacy_accettata: payload.privacy_accettata,
          statuto_accettato: payload.statuto_accettato,
          trattamento_dati_associazione: payload.trattamento_dati_associazione,
          consenso_minore_finalita_associazione:
            payload.consenso_minore_finalita_associazione,
        })
        .eq('socio_id', payload.socioId)
        .select()
        .single();
    } else {
      result = await supabase
        .from('consensi_soci')
        .insert({
          socio_id: payload.socioId,
          consenso_prestato_da: payload.consenso_prestato_da || null,
          consenso_at: payload.consenso_at || null,
          privacy_accettata: payload.privacy_accettata,
          statuto_accettato: payload.statuto_accettato,
          trattamento_dati_associazione: payload.trattamento_dati_associazione,
          consenso_minore_finalita_associazione:
            payload.consenso_minore_finalita_associazione,
        })
        .select()
        .single();
    }

    if (result.error) return { ok: false, error: result.error.message };

    revalidatePath(`/soci/${payload.socioId}`);
    return { ok: true, data: result.data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : 'Errore salvataggio consensi.',
    };
  }
}

export async function saveTutoreSocioAction(payload: {
  socioId: string;
  nome: string;
  cognome: string;
  data_nascita: string;
  luogo_nascita: string;
  provincia_nascita: string;
  codice_fiscale: string;
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  telefono?: string;
  email?: string;
}): Promise<Result> {
  try {
    if (
      !payload.nome ||
      !payload.cognome ||
      !payload.data_nascita ||
      !payload.luogo_nascita ||
      !payload.provincia_nascita ||
      !payload.codice_fiscale
    ) {
      return {
        ok: false,
        error: 'Compila tutti i campi obbligatori del tutore.',
      };
    }

    const supabase = await getSupabaseServerClient();

    const { data: existing } = await supabase
      .from('tutori_soci')
      .select('id')
      .eq('socio_id', payload.socioId)
      .maybeSingle();

    let result;
    if (existing?.id) {
      result = await supabase
        .from('tutori_soci')
        .update({
          nome: payload.nome,
          cognome: payload.cognome,
          data_nascita: payload.data_nascita || null,
          luogo_nascita: payload.luogo_nascita || null,
          provincia_nascita: payload.provincia_nascita || null,
          codice_fiscale: payload.codice_fiscale || null,
          indirizzo: payload.indirizzo || null,
          cap: payload.cap || null,
          comune: payload.comune || null,
          provincia: payload.provincia || null,
          telefono: payload.telefono || null,
          email: payload.email || null,
        })
        .eq('socio_id', payload.socioId)
        .select()
        .single();
    } else {
      result = await supabase
        .from('tutori_soci')
        .insert({
          socio_id: payload.socioId,
          nome: payload.nome,
          cognome: payload.cognome,
          data_nascita: payload.data_nascita || null,
          luogo_nascita: payload.luogo_nascita || null,
          provincia_nascita: payload.provincia_nascita || null,
          codice_fiscale: payload.codice_fiscale || null,
          indirizzo: payload.indirizzo || null,
          cap: payload.cap || null,
          comune: payload.comune || null,
          provincia: payload.provincia || null,
          telefono: payload.telefono || null,
          email: payload.email || null,
        })
        .select()
        .single();
    }

    if (result.error) return { ok: false, error: result.error.message };

    revalidatePath(`/soci/${payload.socioId}`);
    return { ok: true, data: result.data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : 'Errore salvataggio tutore.',
    };
  }
}



async function sendMailBenvenutoSocio(params: {
  to: string;
  subject: string;
  body: string;
  html?: string;
}) {
  if (!mailTransport || !smtpUser) {
    throw new Error('Configurazione SMTP mancante.');
  }

  await mailTransport.sendMail({
    from: smtpUser,
    to: params.to,
    subject: params.subject,
    text: params.body,
    html: params.html,
  });
}

function buildEmailBenvenutoSocio(params: {
  nome: string;
  origineInserimento?: string | null;
  ricevutaUrl: string;
  walletUrl: string;
  whatsappUrl: string;
  privacyUrl: string;
  statutoUrl: string;
  trattamentoDatiUrl: string;
}) {
  const nomeSocio = params.nome?.trim() || 'socio';

  const bodyBase = `Ciao ${nomeSocio},

la tua registrazione come socio è stata confermata con successo.

Puoi consultare la ricevuta del pagamento qui:
${params.ricevutaUrl}

Puoi scaricare la tua tessera digitale nel wallet qui:
${params.walletUrl}

Puoi accedere alla chat cittadina WhatsApp qui:
${params.whatsappUrl}

A presto,
Angeli dei Navigli ODV ETS`;

  const bodyConsensi =
    params.origineInserimento === 'operatore'
      ? `

Conferma consensi letti e accettati:
✔ Ha letto e accettato l’informativa privacy:
${params.privacyUrl}

✔ Ha letto e accettato lo statuto:
${params.statutoUrl}

✔ Consente al trattamento dati per finalità associative:
${params.trattamentoDatiUrl}`
      : '';

  const htmlBase = `
    <p>Ciao ${nomeSocio},</p>

    <p>la tua registrazione come socio è stata confermata con successo.</p>

    <p>
      Puoi consultare la ricevuta del pagamento
      <a href="${params.ricevutaUrl}">qui</a>.
    </p>

    <p>
      Puoi scaricare la tua tessera digitale nel wallet
      <a href="${params.walletUrl}">qui</a>.
    </p>

    <p>
      Puoi accedere alla chat cittadina WhatsApp
      <a href="${params.whatsappUrl}">qui</a>.
    </p>

    <p>A presto,<br />Angeli dei Navigli ODV ETS</p>
  `;

  const htmlConsensi =
    params.origineInserimento === 'operatore'
      ? `
        <p>Conferma consensi letti e accettati:</p>
        <p>✔ <a href="${params.privacyUrl}">Ha letto e accettato l’informativa privacy</a></p>
        <p>✔ <a href="${params.statutoUrl}">Ha letto e accettato lo statuto</a></p>
        <p>✔ <a href="${params.trattamentoDatiUrl}">Consente al trattamento dati per finalità associative</a></p>
      `
      : '';

  return {
    subject: 'Conferma registrazione socio',
    body: `${bodyBase}${bodyConsensi}`,
    html: `${htmlBase}${htmlConsensi}`,
  };
}

const appBaseUrl =
  process.env.APP_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

const whatsappUrl =
  process.env.WHATSAPP_CHAT_URL || 'https://www.angelideinavigli.org/associati/';

const privacyUrl =
  process.env.PRIVACY_URL || 'https://www.angelideinavigli.org/associati/';

const statutoUrl =
  process.env.STATUTO_URL || 'https://www.angelideinavigli.org/associati/';

const trattamentoDatiUrl =
  process.env.TRATTAMENTO_DATI_URL || 'https://www.angelideinavigli.org/associati/';

export async function toggleSocioStatusAction(payload: {
  socioId: string;
  stato: 'attivo' | 'sospeso';
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const updatePayload: {
      stato: 'attivo' | 'sospeso';
      scheda_completata?: boolean;
    } = {
      stato: payload.stato,
    };

    if (payload.stato === 'attivo') {
      updatePayload.scheda_completata = true;
    }

    const { data, error } = await supabase
      .from('soci')
      .update(updatePayload)
      .eq('id', payload.socioId)
      .select(
        'id, codice_univoco, nome, cognome, stato, email, email_benvenuto_inviata_at, origine_inserimento'
      )
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    let publicToken: string | null = null;

    if (payload.stato === 'attivo') {
      const { data: tesseraEsistente, error: tesseraCheckError } = await supabase
        .from('tessere_digitali')
        .select('id, public_token')
        .eq('socio_id', payload.socioId)
        .maybeSingle();

      if (tesseraCheckError) {
        return { ok: false, error: tesseraCheckError.message };
      }

      if (!tesseraEsistente) {
        const annoCorrente = new Date().getFullYear();

        publicToken =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID().replace(/-/g, '')
            : `${Date.now()}${Math.random().toString(36).slice(2)}`;

        const { error: tesseraInsertError } = await supabase
          .from('tessere_digitali')
          .insert({
  socio_id: payload.socioId,
  codice_tessera: data.codice_univoco,
  public_token: publicToken,
  wallet_inviato: false,
  email_inviata: false,
  stato: 'attiva',
  anno_validita: annoCorrente,
  scadenza_al: `${annoCorrente}-12-31`,
});

        if (tesseraInsertError) {
          return { ok: false, error: tesseraInsertError.message };
        }
      } else {
        publicToken = tesseraEsistente.public_token ?? null;
      }
    }

    if (
      payload.stato === 'attivo' &&
      data.email &&
      !data.email_benvenuto_inviata_at
    ) {
      const { data: ultimoPagamento, error: pagamentoError } = await supabase
        .from('pagamenti_soci')
        .select('id')
        .eq('socio_id', payload.socioId)
        .order('data_pagamento', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pagamentoError) {
        return { ok: false, error: pagamentoError.message };
      }

      const ricevutaUrl = ultimoPagamento?.id
        ? `${appBaseUrl}/soci/ricevuta/${ultimoPagamento.id}`
        : `${appBaseUrl}/soci/${payload.socioId}`;

      const walletUrl = publicToken
  ? `${appBaseUrl}/api/apple-wallet/${publicToken}`
  : `${appBaseUrl}/tessere`;

      const emailContent = buildEmailBenvenutoSocio({
        nome: data.nome,
        origineInserimento: data.origine_inserimento ?? null,
        ricevutaUrl,
        walletUrl,
        whatsappUrl,
        privacyUrl,
        statutoUrl,
        trattamentoDatiUrl,
      });

      try {
        await sendMailBenvenutoSocio({
  to: data.email,
  subject: emailContent.subject,
  body: emailContent.body,
  html: emailContent.html,
});

        await supabase
          .from('soci')
          .update({
            email_benvenuto_inviata_at: new Date().toISOString(),
          })
          .eq('id', payload.socioId);
      } catch (mailError) {
        return {
          ok: false,
          error:
            mailError instanceof Error
              ? `Errore invio mail: ${mailError.message}`
              : 'Errore invio mail.',
        };
      }
    }

    revalidatePath('/soci');
    revalidatePath(`/soci/${payload.socioId}`);
    revalidatePath('/tessere');
    revalidatePath('/');

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante l’aggiornamento dello stato del socio.',
    };
  }
}

export async function toggleSocioVolunteerAction(payload: {
  socioId: string;
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: socio, error: socioError } = await supabase
      .from('soci')
      .select(`
        id,
        codice_univoco,
        nome,
        cognome,
        data_nascita,
        luogo_nascita,
        provincia_nascita,
        codice_fiscale,
        indirizzo,
        cap,
        comune,
        provincia,
        telefono,
        email,
        e_minorenne,
        e_anche_volontario
      `)
      .eq('id', payload.socioId)
      .single();

    if (socioError) {
      return { ok: false, error: socioError.message };
    }

    if (!socio) {
      return { ok: false, error: 'Socio non trovato.' };
    }

    if (socio.e_anche_volontario) {
      return { ok: false, error: 'Questo socio è già attivo anche come volontario.' };
    }

    const { data: volontarioEsistente, error: volontarioCheckError } = await supabase
      .from('volontari')
      .select('id')
      .eq('socio_id', payload.socioId)
      .maybeSingle();

    if (volontarioCheckError) {
      return { ok: false, error: volontarioCheckError.message };
    }

    if (volontarioEsistente) {
      const { data, error } = await supabase
        .from('soci')
        .update({
          e_anche_volontario: true,
          modifica_bloccata: true,
        })
        .eq('id', payload.socioId)
        .select()
        .single();

      if (error) {
        return { ok: false, error: error.message };
      }

      revalidatePath('/soci');
      revalidatePath(`/soci/${payload.socioId}`);
      revalidatePath('/volontari');
      revalidatePath('/');

      return { ok: true, data };
    }

    const { error: insertVolontarioError } = await supabase
      .from('volontari')
      .insert({
        organizzazione_id: ORGANIZZAZIONE_ID,
        socio_id: socio.id,
        codice_univoco: socio.codice_univoco,
        nome: socio.nome,
        cognome: socio.cognome,
        stato: 'attivo',
        tipologia: 'occasionale',
        data_inizio: new Date().toISOString().slice(0, 10),
        data_nascita: socio.data_nascita || null,
        luogo_nascita: socio.luogo_nascita || null,
        provincia_nascita: socio.provincia_nascita || null,
        codice_fiscale: socio.codice_fiscale || null,
        indirizzo: socio.indirizzo || null,
        cap: socio.cap || null,
        comune: socio.comune || null,
        provincia: socio.provincia || null,
        telefono: socio.telefono || null,
        email: socio.email || null,
        minorenne: socio.e_minorenne ?? false,
        modifica_bloccata: true,
      });

    if (insertVolontarioError) {
      return { ok: false, error: insertVolontarioError.message };
    }

    const { data, error } = await supabase
      .from('soci')
      .update({
        e_anche_volontario: true,
        modifica_bloccata: true,
      })
      .eq('id', payload.socioId)
      .select()
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/soci');
    revalidatePath(`/soci/${payload.socioId}`);
    revalidatePath('/volontari');
    revalidatePath('/');

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante l’attivazione del socio come volontario.',
    };
  }
}

export async function archiviaSocioAction(payload: {
  socioId: string;
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: existing, error: existingError } = await supabase
      .from('soci')
      .select('id, stato, archiviato')
      .eq('id', payload.socioId)
      .single();

    if (existingError) {
      return { ok: false, error: existingError.message };
    }

    if (existing?.archiviato) {
      return { ok: false, error: 'Il socio è già archiviato.' };
    }

    if (existing?.stato !== 'sospeso') {
      return { ok: false, error: 'Puoi archiviare solo un socio sospeso.' };
    }

    const { data, error } = await supabase
      .from('soci')
      .update({
        archiviato: true,
        stato: 'sospeso',
      })
      .eq('id', payload.socioId)
      .select()
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/soci');
    revalidatePath(`/soci/${payload.socioId}`);
    revalidatePath('/');

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante l’archiviazione del socio.',
    };
  }
}

export async function ripristinaSocioAction(payload: {
  socioId: string;
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: existing, error: existingError } = await supabase
      .from('soci')
      .select('id, archiviato')
      .eq('id', payload.socioId)
      .single();

    if (existingError) {
      return { ok: false, error: existingError.message };
    }

    if (!existing?.archiviato) {
      return { ok: false, error: 'Il socio non è archiviato.' };
    }

    const { data, error } = await supabase
      .from('soci')
      .update({
        archiviato: false,
        stato: 'sospeso',
      })
      .eq('id', payload.socioId)
      .select()
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/soci');
    revalidatePath(`/soci/${payload.socioId}`);
    revalidatePath('/');

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante il ripristino del socio.',
    };
  }
}

export async function sospendiSociNonRinnovatiAction(): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();
    const annoCorrente = new Date().getFullYear();

    const { data: sociAttivi, error: sociError } = await supabase
      .from('soci')
      .select('id, stato, archiviato')
      .eq('stato', 'attivo')
      .eq('archiviato', false);

    if (sociError) {
      return { ok: false, error: sociError.message };
    }

    const socioIds = (sociAttivi ?? []).map((s) => s.id);

    if (socioIds.length === 0) {
      return { ok: true, data: { aggiornati: 0 } };
    }

    const { data: pagamentiAnnoCorrente, error: pagamentiError } = await supabase
      .from('pagamenti_soci')
      .select('socio_id, anno_quota')
      .in('socio_id', socioIds)
      .eq('anno_quota', annoCorrente);

    if (pagamentiError) {
      return { ok: false, error: pagamentiError.message };
    }

    const sociConQuotaCorrente = new Set(
      (pagamentiAnnoCorrente ?? []).map((p) => p.socio_id)
    );

    const sociDaSospendere = socioIds.filter(
      (socioId) => !sociConQuotaCorrente.has(socioId)
    );

    if (sociDaSospendere.length === 0) {
      return { ok: true, data: { aggiornati: 0 } };
    }

    const { error: updateError } = await supabase
      .from('soci')
      .update({ stato: 'sospeso' })
      .in('id', sociDaSospendere);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    revalidatePath('/soci');
    revalidatePath('/');
    return { ok: true, data: { aggiornati: sociDaSospendere.length } };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante la sospensione automatica dei soci non rinnovati.',
    };
  }
}

export async function preparaReminderRinnoviAction(): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();
    const annoCorrente = new Date().getFullYear();
    const annoSuccessivo = annoCorrente + 1;

    const { data: sociAttivi, error: sociError } = await supabase
      .from('soci')
      .select('id, nome, cognome, email, codice_univoco, stato, archiviato')
      .eq('stato', 'attivo')
      .eq('archiviato', false)
      .not('email', 'is', null);

    if (sociError) {
      return { ok: false, error: sociError.message };
    }

    const sociConEmail = (sociAttivi ?? []).filter(
      (s) => typeof s.email === 'string' && s.email.trim() !== ''
    );

    const reminders = sociConEmail.map((socio) => {
      const subject = `Rinnovo quota associativa ${annoSuccessivo}`;

      const body = `Ciao ${socio.nome},

è arrivato il momento di rinnovare la tua quota associativa.

Il rinnovo non è obbligatorio, ma se desideri continuare a sostenere le nostre iniziative, puoi accedere all’area Rinnovi tramite questo link:
https://www.angelideinavigli.org/associati/

Per procedere al rinnovo, inserisci il tuo codice socio: ${socio.codice_univoco}

Potrai completare la procedura in pochi passaggi.

Se hai già provveduto, puoi ignorare questo promemoria.

Per qualsiasi dubbio o informazione, siamo qui.

A presto,
Angeli dei Navigli ODV ETS`;

      return {
        socioId: socio.id,
        nome: socio.nome,
        cognome: socio.cognome,
        email: socio.email,
        codice_univoco: socio.codice_univoco,
        subject,
        body,
      };
    });

    return {
      ok: true,
      data: {
        totale: reminders.length,
        reminders,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : 'Errore durante la preparazione dei reminder rinnovi.',
    };
  }
}
export async function createPagamentoSocioAction(payload: {
  socioId: string;
  causale: string;
  importo: number;
  metodo: 'paypal' | 'bonifico' | 'contanti';
  data_pagamento: string;
  numero_transazione?: string;
  intestatario_transazione?: string;
  indirizzo?: string;
  codice_fiscale_pagatore?: string;
  tipo_pagatore?: string;
  nota?: string;
  anno_quota?: number;
  tipo_quota?: 'prima_iscrizione' | 'rinnovo';
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const dataPagamentoEffettiva =
      payload.data_pagamento || new Date().toISOString().slice(0, 10);

    if (payload.metodo === 'paypal' && !payload.numero_transazione?.trim()) {
      return {
        ok: false,
        error: 'Per un pagamento PayPal serve il numero transazione.',
      };
    }

    const annoQuota =
      payload.anno_quota ?? Number(dataPagamentoEffettiva.slice(0, 4));

    const tipoQuota = payload.tipo_quota ?? 'prima_iscrizione';

    const { data, error } = await supabase
      .from('pagamenti_soci')
      .insert({
        socio_id: payload.socioId,
        causale: payload.causale,
        importo: payload.importo,
        metodo: payload.metodo,
        data_pagamento: dataPagamentoEffettiva,
        numero_transazione: payload.numero_transazione || null,
        intestatario_transazione: payload.intestatario_transazione || null,
        indirizzo: payload.indirizzo || null,
        codice_fiscale_pagatore: payload.codice_fiscale_pagatore || null,
        tipo_pagatore: payload.tipo_pagatore || null,
        nota: payload.nota || null,
        anno_quota: annoQuota,
        tipo_quota: tipoQuota,
      })
      .select()
      .single();

    if (error) return { ok: false, error: error.message };

    if (tipoQuota === 'rinnovo') {
  const { error: tesseraUpdateError } = await supabase
    .from('tessere_digitali')
    .update({
      anno_validita: annoQuota,
      scadenza_al: `${annoQuota}-12-31`,
      stato: 'attiva',
      wallet_inviato: false,
      email_inviata: false,
    })
    .eq('socio_id', payload.socioId);

  if (tesseraUpdateError) {
    return { ok: false, error: tesseraUpdateError.message };
  }
}

    revalidatePath(`/soci/${payload.socioId}`);
    revalidatePath('/soci');
    revalidatePath('/tessere');

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : 'Errore creazione pagamento.',
    };
  }
}