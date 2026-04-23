'use server';

import * as nodemailer from 'nodemailer';
import {
  createPagamentoSocioAction,
  createSocioAction,
  saveConsensiSocioAction,
  saveTutoreSocioAction,
  toggleSocioStatusAction,
} from '@/app/(gestionale)/soci/actions';

type Result<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type SubmitIscrizionePayload = {
  nome: string;
  cognome: string;
  dataNascita: string;
  nascitaSocio: 'italia' | 'estero' | '';
  luogoNascita: string;
  provinciaNascita: string;
  statoNascitaEstero?: string;
  cittaNascitaEstero?: string;
  codiceFiscale: string;
  email: string;
  telefono: string;
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  minorenne: 'si' | 'no';
  chiPaga: 'socio' | 'tutore' | 'altro' | '';
  metodoPagamento: 'paypal' | 'bonifico';
  tutoreNome?: string;
  tutoreCognome?: string;
  tutoreDataNascita?: string;
  nascitaTutore?: 'italia' | 'estero' | '';
  tutoreLuogoNascita?: string;
  tutoreProvinciaNascita?: string;
  tutoreStatoNascitaEstero?: string;
  tutoreCittaNascitaEstero?: string;
  tutoreCodiceFiscale?: string;
  tutoreEmail?: string;
  tutoreTelefono?: string;
  tutoreIndirizzo?: string;
  tutoreCap?: string;
  tutoreComune?: string;
  tutoreProvincia?: string;
  pagatoreNome?: string;
  pagatoreCognome?: string;
  pagatoreIndirizzo?: string;
  pagatoreCap?: string;
  pagatoreComune?: string;
  pagatoreProvincia?: string;
  pagatoreCfPiva?: string;
  paypalTransactionId?: string;
};

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const notificaIscrizioniEmail =
  process.env.NOTIFICA_ISCRIZIONI_EMAIL || 'info@angelideinavigli.org';

const privacyUrl =
  process.env.PRIVACY_URL ||
  'https://www.angelideinavigli.org/wp-content/uploads/2026/03/Informativa-Privacy_WEB.pdf';

const statutoUrl =
  process.env.STATUTO_URL ||
  'https://www.angelideinavigli.org/wp-content/uploads/2026/03/Statuto_Rev.130326.pdf';

const trattamentoDatiUrl =
  process.env.TRATTAMENTO_DATI_URL ||
  'https://www.angelideinavigli.org/wp-content/uploads/2026/03/Trattamento-dati_WEB.pdf';

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

function clean(value: unknown) {
  return String(value || '').trim();
}

function quotaImporto(minorenne: 'si' | 'no') {
  return minorenne === 'si' ? 20 : 30;
}

function luogoNascitaFinale(params: {
  tipo: 'italia' | 'estero' | '';
  comuneItalia?: string;
  provinciaItalia?: string;
  statoEstero?: string;
  cittaEstero?: string;
}) {
  if (params.tipo === 'estero') {
    return {
      luogo_nascita: [clean(params.cittaEstero), clean(params.statoEstero)]
        .filter(Boolean)
        .join(' - '),
      provincia_nascita: 'EE',
    };
  }

  return {
    luogo_nascita: clean(params.comuneItalia),
    provincia_nascita: clean(params.provinciaItalia).toUpperCase(),
  };
}

function getConsensoPrestatoDa(payload: SubmitIscrizionePayload) {
  if (payload.minorenne === 'si') {
    return `${clean(payload.tutoreNome)} ${clean(payload.tutoreCognome)}`.trim();
  }

  return `${clean(payload.nome)} ${clean(payload.cognome)}`.trim();
}

function getTipoPagatore(payload: SubmitIscrizionePayload) {
  if (payload.chiPaga === 'altro') return 'altro';
  if (payload.minorenne === 'si') return 'tutore';
  return 'socio';
}

function getIntestatarioTransazione(payload: SubmitIscrizionePayload) {
  if (payload.chiPaga === 'altro') {
    return `${clean(payload.pagatoreNome)} ${clean(payload.pagatoreCognome)}`.trim();
  }

  if (payload.minorenne === 'si') {
    return `${clean(payload.tutoreNome)} ${clean(payload.tutoreCognome)}`.trim();
  }

  return `${clean(payload.nome)} ${clean(payload.cognome)}`.trim();
}

function getIndirizzoPagatore(payload: SubmitIscrizionePayload) {
  if (payload.chiPaga === 'altro') {
    return [
      clean(payload.pagatoreIndirizzo),
      clean(payload.pagatoreCap),
      clean(payload.pagatoreComune),
      clean(payload.pagatoreProvincia),
    ]
      .filter(Boolean)
      .join(', ');
  }

  if (payload.minorenne === 'si') {
    return [
      clean(payload.tutoreIndirizzo),
      clean(payload.tutoreCap),
      clean(payload.tutoreComune),
      clean(payload.tutoreProvincia),
    ]
      .filter(Boolean)
      .join(', ');
  }

  return [
    clean(payload.indirizzo),
    clean(payload.cap),
    clean(payload.comune),
    clean(payload.provincia),
  ]
    .filter(Boolean)
    .join(', ');
}

function getCodiceFiscalePagatore(payload: SubmitIscrizionePayload) {
  if (payload.chiPaga === 'altro') return clean(payload.pagatoreCfPiva);
  if (payload.minorenne === 'si') return clean(payload.tutoreCodiceFiscale);
  return clean(payload.codiceFiscale);
}

async function sendMail(params: {
  to: string;
  subject: string;
  body: string;
  html?: string;
}) {
  if (!mailTransport || !smtpUser) {
    return;
  }

  await mailTransport.sendMail({
    from: smtpUser,
    to: params.to,
    subject: params.subject,
    text: params.body,
    html: params.html,
  });
}

function buildMailAttesaBonifico(payload: SubmitIscrizionePayload) {
  const destinatario =
    payload.minorenne === 'si'
      ? `${clean(payload.tutoreNome)} ${clean(payload.tutoreCognome)}`.trim()
      : `${clean(payload.nome)} ${clean(payload.cognome)}`.trim();

  const importo = quotaImporto(payload.minorenne).toFixed(2);
  const causale = `Iscrizione ${clean(payload.nome)} ${clean(payload.cognome)}`.trim();

  return {
    subject: 'Registrazione ricevuta - in attesa di verifica pagamento',
    body: `Ciao ${destinatario},

abbiamo ricevuto correttamente la tua richiesta di iscrizione ad Angeli dei Navigli.

La quota associativa dovrà essere versata tramite bonifico bancario intestato a:

Angeli dei Navigli ODV
IBAN: IT78F0623001621000040503267
Causale: ${causale}

Importo quota associativa: € ${importo}

La tua iscrizione sarà confermata solo dopo la verifica dell’avvenuto pagamento.

Una volta completata la registrazione, riceverai la tessera digitale e tutte le informazioni utili per partecipare alla vita associativa.

Essere socio di Angeli dei Navigli significa avere accesso a vantaggi dedicati, tra cui:
- accesso prioritario alla prenotazione delle uscite in barca, fino a esaurimento dei posti disponibili
- partecipazione alle uscite in barca senza quota aggiuntiva
- inviti a eventi speciali riservati ai soci
- condizioni dedicate relative ai materiali identificativi dell’associazione

Documenti confermati in fase di iscrizione:
Privacy: ${privacyUrl}
Statuto: ${statutoUrl}
Trattamento dati: ${trattamentoDatiUrl}

Grazie mille e a presto!
Angeli dei Navigli ODV ETS`,
    html: `
    <p>Ciao ${destinatario},</p>
    <p>abbiamo ricevuto correttamente la tua richiesta di iscrizione ad Angeli dei Navigli.</p>
    <p>La quota associativa dovrà essere versata tramite bonifico bancario intestato a:</p>
    <p>
      <strong>Angeli dei Navigli ODV</strong><br />
      <strong>IBAN:</strong> IT78F0623001621000040503267<br />
      <strong>Causale:</strong> ${causale}<br />
      <strong>Importo quota associativa:</strong> € ${importo}
    </p>
    <p>La tua iscrizione sarà confermata solo dopo la verifica dell’avvenuto pagamento.</p>
    <p>Una volta completata la registrazione, riceverai la tessera digitale e tutte le informazioni utili per partecipare alla vita associativa.</p>
    <p><strong>Essere socio di Angeli dei Navigli significa avere accesso a vantaggi dedicati, tra cui:</strong></p>
    <ul>
      <li>accesso prioritario alla prenotazione delle uscite in barca, fino a esaurimento dei posti disponibili</li>
      <li>partecipazione alle uscite in barca senza quota aggiuntiva</li>
      <li>inviti a eventi speciali riservati ai soci</li>
      <li>condizioni dedicate relative ai materiali identificativi dell’associazione</li>
    </ul>
    <p>Documenti confermati in fase di iscrizione:</p>
    <p><a href="${privacyUrl}">Privacy</a></p>
    <p><a href="${statutoUrl}">Statuto</a></p>
    <p><a href="${trattamentoDatiUrl}">Trattamento dati</a></p>
    <p>Grazie mille e a presto!<br />Angeli dei Navigli ODV ETS</p>
  `,
  };
}

function buildMailConfermaPaypal(payload: SubmitIscrizionePayload) {
  const destinatario =
    payload.minorenne === 'si'
      ? `${clean(payload.tutoreNome)} ${clean(payload.tutoreCognome)}`.trim()
      : `${clean(payload.nome)} ${clean(payload.cognome)}`.trim();

  const importo = quotaImporto(payload.minorenne).toFixed(2);

  return {
    subject: 'Iscrizione confermata - pagamento ricevuto',
    body: `Ciao ${destinatario},

il pagamento della quota associativa è stato registrato correttamente.

La tua iscrizione ad Angeli dei Navigli è stata confermata con successo.

Importo quota associativa: € ${importo}
Metodo pagamento: PayPal

Da questo momento potrai usufruire dei vantaggi riservati ai soci, tra cui:
- accesso prioritario alla prenotazione delle uscite in barca, fino a esaurimento dei posti disponibili
- partecipazione alle uscite in barca senza quota aggiuntiva
- inviti a eventi speciali riservati ai soci
- condizioni dedicate relative ai materiali identificativi dell’associazione

Documenti confermati in fase di iscrizione:
Privacy: ${privacyUrl}
Statuto: ${statutoUrl}
Trattamento dati: ${trattamentoDatiUrl}

Grazie mille e a presto!
Angeli dei Navigli ODV ETS`,
    html: `
    <p>Ciao ${destinatario},</p>
    <p>il pagamento della quota associativa è stato registrato correttamente.</p>
    <p>La tua iscrizione ad Angeli dei Navigli è stata confermata con successo.</p>
    <p>
      <strong>Importo quota associativa:</strong> € ${importo}<br />
      <strong>Metodo pagamento:</strong> PayPal
    </p>
    <p><strong>Da questo momento potrai usufruire dei vantaggi riservati ai soci, tra cui:</strong></p>
    <ul>
      <li>accesso prioritario alla prenotazione delle uscite in barca, fino a esaurimento dei posti disponibili</li>
      <li>partecipazione alle uscite in barca senza quota aggiuntiva</li>
      <li>inviti a eventi speciali riservati ai soci</li>
      <li>condizioni dedicate relative ai materiali identificativi dell’associazione</li>
    </ul>
    <p>Documenti confermati in fase di iscrizione:</p>
    <p><a href="${privacyUrl}">Privacy</a></p>
    <p><a href="${statutoUrl}">Statuto</a></p>
    <p><a href="${trattamentoDatiUrl}">Trattamento dati</a></p>
    <p>Grazie mille e a presto!<br />Angeli dei Navigli ODV ETS</p>
  `,
  };
}

function buildMailInterna(payload: SubmitIscrizionePayload) {
  const importo = quotaImporto(payload.minorenne).toFixed(2);

  return {
    subject: `Nuova iscrizione socio - ${clean(payload.nome)} ${clean(payload.cognome)}`.trim(),
    body: `Nuova iscrizione dal sito.

Nome e cognome: ${clean(payload.nome)} ${clean(payload.cognome)}
Email: ${clean(payload.email)}
Importo quota associativa: € ${importo}
Metodo pagamento: ${payload.metodoPagamento}`,
    html: `
      <p>Nuova iscrizione dal sito.</p>
      <p>
        <strong>Nome e cognome:</strong> ${clean(payload.nome)} ${clean(payload.cognome)}<br />
        <strong>Email:</strong> ${clean(payload.email)}<br />
        <strong>Importo quota associativa:</strong> € ${importo}<br />
        <strong>Metodo pagamento:</strong> ${payload.metodoPagamento}
      </p>
    `,
  };
}

export async function submitIscrizioneAction(
  payload: SubmitIscrizionePayload
): Promise<Result<{ socioId: string }>> {
  try {
    const nome = clean(payload.nome);
    const cognome = clean(payload.cognome);
    const email = clean(payload.email);
    const codiceFiscale = clean(payload.codiceFiscale);

    if (!nome || !cognome || !email || !codiceFiscale) {
      return { ok: false, error: 'Campi obbligatori mancanti.' };
    }

    const nascitaSocioFinale = luogoNascitaFinale({
      tipo: payload.nascitaSocio,
      comuneItalia: payload.luogoNascita,
      provinciaItalia: payload.provinciaNascita,
      statoEstero: payload.statoNascitaEstero,
      cittaEstero: payload.cittaNascitaEstero,
    });

    const createSocioResult = await createSocioAction({
      nome,
      cognome,
      data_nascita: clean(payload.dataNascita),
      luogo_nascita: nascitaSocioFinale.luogo_nascita,
      provincia_nascita: nascitaSocioFinale.provincia_nascita,
      codice_fiscale: codiceFiscale,
      indirizzo: clean(payload.indirizzo),
      cap: clean(payload.cap),
      comune: clean(payload.comune),
      provincia: clean(payload.provincia),
      telefono: clean(payload.telefono),
      email,
      stato: payload.metodoPagamento === 'paypal' ? 'attivo' : 'sospeso',
      data_iscrizione: new Date().toISOString().slice(0, 10),
      e_anche_volontario: false,
      e_minorenne: payload.minorenne === 'si',
    });

    console.log('ISCRIVITI createSocioResult', createSocioResult);
    console.log('ISCRIVITI payload sintetico', { nome, cognome, email, codiceFiscale, metodoPagamento: payload.metodoPagamento });

    if (!createSocioResult.ok) {
      return { ok: false, error: createSocioResult.error };
    }

    const socioId =
      createSocioResult.data &&
        typeof createSocioResult.data === 'object' &&
        'id' in createSocioResult.data
        ? String(createSocioResult.data.id)
        : '';

    if (!socioId) {
      return { ok: false, error: 'Impossibile recuperare il socio creato.' };
    }

    if (payload.minorenne === 'si') {
      const nascitaTutoreFinale = luogoNascitaFinale({
        tipo: payload.nascitaTutore || '',
        comuneItalia: payload.tutoreLuogoNascita,
        provinciaItalia: payload.tutoreProvinciaNascita,
        statoEstero: payload.tutoreStatoNascitaEstero,
        cittaEstero: payload.tutoreCittaNascitaEstero,
      });

      const tutoreResult = await saveTutoreSocioAction({
        socioId,
        nome: clean(payload.tutoreNome),
        cognome: clean(payload.tutoreCognome),
        data_nascita: clean(payload.tutoreDataNascita),
        luogo_nascita: nascitaTutoreFinale.luogo_nascita,
        provincia_nascita: nascitaTutoreFinale.provincia_nascita,
        codice_fiscale: clean(payload.tutoreCodiceFiscale),
        indirizzo: clean(payload.tutoreIndirizzo),
        cap: clean(payload.tutoreCap),
        comune: clean(payload.tutoreComune),
        provincia: clean(payload.tutoreProvincia),
        telefono: clean(payload.tutoreTelefono),
        email: clean(payload.tutoreEmail),
      });

      if (!tutoreResult.ok) {
        return { ok: false, error: tutoreResult.error };
      }
    }

    const consensiResult = await saveConsensiSocioAction({
      socioId,
      consenso_prestato_da: getConsensoPrestatoDa(payload),
      consenso_at: new Date().toISOString(),
      privacy_accettata: true,
      statuto_accettato: true,
      trattamento_dati_associazione: true,
      consenso_minore_finalita_associazione: payload.minorenne === 'si',
    });

    if (!consensiResult.ok) {
      return { ok: false, error: consensiResult.error };
    }

    if (payload.metodoPagamento === 'paypal') {
      const transactionId = clean(payload.paypalTransactionId);

      if (!transactionId) {
        return {
          ok: false,
          error:
            'Per attivare automaticamente un socio con PayPal serve un numero transazione reale.',
        };
      }

      const pagamentoResult = await createPagamentoSocioAction({
        socioId,
        causale: 'Quota associativa',
        importo: quotaImporto(payload.minorenne),
        metodo: 'paypal',
        data_pagamento: new Date().toISOString().slice(0, 10),
        numero_transazione: transactionId,
        intestatario_transazione: getIntestatarioTransazione(payload),
        indirizzo: getIndirizzoPagatore(payload),
        codice_fiscale_pagatore: getCodiceFiscalePagatore(payload),
        tipo_pagatore: getTipoPagatore(payload),
        nota: 'Pagamento registrato da pagina pubblica /iscriviti',
        anno_quota: new Date().getFullYear(),
        tipo_quota: 'prima_iscrizione',
      });

      if (!pagamentoResult.ok) {
        return { ok: false, error: pagamentoResult.error };
      }

      const attivaResult = await toggleSocioStatusAction({
        socioId,
        stato: 'attivo',
      });

      if (!attivaResult.ok) {
        return { ok: false, error: attivaResult.error };
      }

      const mailConferma = buildMailConfermaPaypal(payload);
      await sendMail({
        to: email,
        subject: mailConferma.subject,
        body: mailConferma.body,
        html: mailConferma.html,
      });
    }

    if (payload.metodoPagamento === 'bonifico') {
      const mailAttesa = buildMailAttesaBonifico(payload);
      await sendMail({
        to: email,
        subject: mailAttesa.subject,
        body: mailAttesa.body,
        html: mailAttesa.html,
      });
    }

    const mailInterna = buildMailInterna(payload);
    await sendMail({
      to: notificaIscrizioniEmail,
      subject: mailInterna.subject,
      body: mailInterna.body,
      html: mailInterna.html,
    });

    return { ok: true, data: { socioId } };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : 'Errore durante la registrazione.',
    };
  }
}