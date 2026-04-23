import { getSupabaseClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import type {
  DashboardMetrics,
  DigitalCardRow,
  EventRow,
  GroupRow,
  MemberRow,
  OrganizzazioneSettings,
  TesseraSettings,
  TicketRow,
  TutorialRow,
  VolunteerRow,
  SocioDetail,
} from '@/lib/types';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = getSupabaseClient();

  const [
    { count: soci, error: sociError },
    { count: volontari, error: volontariError },
    { count: occasionali, error: occasionaliError },
    { count: gruppi, error: gruppiError },
    { count: eventi, error: eventiError },
    { count: ticketAperti, error: ticketError },
  ] = await Promise.all([
    supabase.from('soci').select('*', { count: 'exact', head: true }).eq('archiviato', false),
    supabase.from('volontari').select('*', { count: 'exact', head: true }).eq('archiviato', false),
    supabase
      .from('volontari')
      .select('*', { count: 'exact', head: true })
      .eq('tipologia', 'occasionale')
      .eq('archiviato', false),
    supabase.from('gruppi').select('*', { count: 'exact', head: true }),
    supabase.from('eventi').select('*', { count: 'exact', head: true }),
    supabase
      .from('ticket_assistenza')
      .select('*', { count: 'exact', head: true })
      .in('stato', ['aperto', 'in_lavorazione']),
  ]);

  const firstError =
    sociError || volontariError || occasionaliError || gruppiError || eventiError || ticketError;

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    soci: soci ?? 0,
    volontari: volontari ?? 0,
    volontariOccasionali: occasionali ?? 0,
    gruppi: gruppi ?? 0,
    eventi: eventi ?? 0,
    ticketAperti: ticketAperti ?? 0,
  };
}

export async function getSoci(): Promise<MemberRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('soci')
    .select(`
      id,
      codice_univoco,
      nome,
      cognome,
      email,
      telefono,
      stato,
      archiviato,
      data_iscrizione,
      data_nascita,
      luogo_nascita,
      provincia_nascita,
      codice_fiscale,
      indirizzo,
      cap,
      comune,
      provincia,
      e_minorenne,
      e_anche_volontario,
      modifica_bloccata,
      richiede_verifica_volontario
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    codice: row.codice_univoco,
    nome: row.nome,
    cognome: row.cognome,
    email: row.email ?? null,
    telefono: row.telefono ?? null,
    stato: row.stato,
    archiviato: row.archiviato ?? false,
    data_iscrizione: row.data_iscrizione,
    data_nascita: row.data_nascita ?? null,
    luogo_nascita: row.luogo_nascita ?? null,
    provincia_nascita: row.provincia_nascita ?? null,
    codice_fiscale: row.codice_fiscale ?? null,
    indirizzo: row.indirizzo ?? null,
    cap: row.cap ?? null,
    comune: row.comune ?? null,
    provincia: row.provincia ?? null,
    minorenne: row.e_minorenne ?? false,
    volontario: row.e_anche_volontario ?? false,
    modifica_bloccata: row.modifica_bloccata ?? false,
    richiede_verifica_volontario: row.richiede_verifica_volontario ?? false,
  }));
}

export async function getVolontari(): Promise<VolunteerRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('volontari')
    .select(`
      id,
      socio_id,
      codice_univoco,
      nome,
      cognome,
      email,
      telefono,
      stato,
      data_inizio,
      tipologia,
      data_cessazione,
      archiviato
    `)
    .eq('stato', 'attivo')
    .eq('archiviato', false)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  const volontari = data ?? [];
  const socioIds = volontari.map((row) => row.socio_id).filter(Boolean);

  const { data: sociCollegati, error: sociError } = await supabase
    .from('soci')
    .select('id, richiede_verifica_volontario')
    .in('id', socioIds.length ? socioIds : ['00000000-0000-0000-0000-000000000000']);

  if (sociError) throw new Error(sociError.message);

  const sociMap = new Map(
    (sociCollegati ?? []).map((s) => [s.id, s.richiede_verifica_volontario])
  );

  return volontari.map((row) => ({
    id: row.id,
    codice: row.codice_univoco,
    nome: row.nome,
    cognome: row.cognome,
    email: row.email,
    telefono: row.telefono,
    stato: row.stato,
    data_iscrizione: row.data_inizio,
    tipologia: row.tipologia,
    data_cessazione: row.data_cessazione,
    archiviato: row.archiviato,
    socio_id: row.socio_id ?? null,
    richiede_verifica_volontario: row.socio_id ? (sociMap.get(row.socio_id) ?? false) : false,
  }));
}

export async function getVolontariCompleti(): Promise<VolunteerRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('volontari')
    .select(`
      id,
      socio_id,
      codice_univoco,
      nome,
      cognome,
      email,
      telefono,
      stato,
      data_inizio,
      tipologia,
      data_cessazione,
      archiviato
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  const volontari = data ?? [];
  const socioIds = volontari.map((row) => row.socio_id).filter(Boolean);

  const { data: sociCollegati, error: sociError } = await supabase
    .from('soci')
    .select('id, richiede_verifica_volontario')
    .in('id', socioIds.length ? socioIds : ['00000000-0000-0000-0000-000000000000']);

  if (sociError) throw new Error(sociError.message);

  const sociMap = new Map(
    (sociCollegati ?? []).map((s) => [s.id, s.richiede_verifica_volontario])
  );

  return volontari.map((row) => ({
    id: row.id,
    codice: row.codice_univoco,
    nome: row.nome,
    cognome: row.cognome,
    email: row.email,
    telefono: row.telefono,
    stato: row.stato,
    data_iscrizione: row.data_inizio,
    tipologia: row.tipologia,
    data_cessazione: row.data_cessazione,
    archiviato: row.archiviato,
    socio_id: row.socio_id ?? null,
    richiede_verifica_volontario: row.socio_id ? (sociMap.get(row.socio_id) ?? false) : false,
  }));
}

export async function getGroups(): Promise<GroupRow[]> {
  const supabase = getSupabaseClient();

  const { data: gruppi, error } = await supabase.from('gruppi').select('id,nome').order('nome');
  if (error) throw new Error(error.message);

  const result: GroupRow[] = [];

  for (const gruppo of gruppi ?? []) {
    const [{ count: soci, error: sociError }, { count: volontari, error: volError }] =
      await Promise.all([
        supabase
          .from('gruppo_soci')
          .select('*', { count: 'exact', head: true })
          .eq('gruppo_id', gruppo.id),
        supabase
          .from('gruppo_volontari')
          .select('*', { count: 'exact', head: true })
          .eq('gruppo_id', gruppo.id),
      ]);

    if (sociError) throw new Error(sociError.message);
    if (volError) throw new Error(volError.message);

    result.push({
      id: gruppo.id,
      nome: gruppo.nome,
      soci: soci ?? 0,
      volontari: volontari ?? 0,
      totale: (soci ?? 0) + (volontari ?? 0),
    });
  }

  return result;
}

export async function getEvents(): Promise<EventRow[]> {
  const supabase = getSupabaseClient();

  const { data: eventi, error } = await supabase
    .from('eventi')
    .select('id,nome,data_evento,descrizione')
    .order('data_evento', { ascending: true })
    .limit(20);

  if (error) throw new Error(error.message);

  const result: EventRow[] = [];

  for (const evento of eventi ?? []) {
    const { data: relazioni, error: relError } = await supabase
      .from('evento_gruppi')
      .select('gruppo_id')
      .eq('evento_id', evento.id);

    if (relError) throw new Error(relError.message);

    const gruppoIds = (relazioni ?? []).map((r: any) => r.gruppo_id).filter(Boolean);

    let gruppiNomi: string[] = [];

    if (gruppoIds.length > 0) {
      const { data: gruppi, error: gruppiError } = await supabase
        .from('gruppi')
        .select('id,nome')
        .in('id', gruppoIds);

      if (gruppiError) throw new Error(gruppiError.message);

      gruppiNomi = (gruppi ?? []).map((g: any) => g.nome).filter(Boolean);
    }

    result.push({
      id: evento.id,
      nome: evento.nome,
      data_evento: evento.data_evento,
      descrizione: evento.descrizione ?? '',
      gruppi: gruppiNomi,
      soci_coinvolti: 0,
      volontari_coinvolti: 0,
    });
  }

  return result;
}

export async function getDigitalCards(): Promise<DigitalCardRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tessere_digitali')
    .select(
  'id,codice_tessera,public_token,wallet_inviato,email_inviata,stato,socio_id,anno_validita,scadenza_al,google_wallet_url,apple_wallet_url'
)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  const result: DigitalCardRow[] = [];

  for (const row of data ?? []) {
    let socioLabel = 'Socio';

    if ((row as any).socio_id) {
      const { data: socio, error: socioError } = await supabase
        .from('soci')
        .select('nome,cognome')
        .eq('id', (row as any).socio_id)
        .maybeSingle();

      if (socioError) throw new Error(socioError.message);

      if (socio) {
        socioLabel = `${socio.nome ?? ''} ${socio.cognome ?? ''}`.trim();
      }
    }

    result.push({
  id: (row as any).id,
  socio: socioLabel,
  codice_tessera: (row as any).codice_tessera,
  public_token: (row as any).public_token ?? null,
  wallet_inviato: (row as any).wallet_inviato,
  email_inviata: (row as any).email_inviata,
  stato: (row as any).stato,
  anno_validita: (row as any).anno_validita ?? null,
  scadenza_al: (row as any).scadenza_al ?? null,
  google_wallet_url: (row as any).google_wallet_url ?? null,
  apple_wallet_url: (row as any).apple_wallet_url ?? null,
});
  }

  return result;
}

export async function getDigitalCardByPublicToken(publicToken: string) {
  const supabase = await getSupabaseServerClient();

  const { data: tessera, error: tesseraError } = await supabase
    .from('tessere_digitali')
    .select(`
      id,
      socio_id,
      codice_tessera,
      public_token,
      wallet_inviato,
      email_inviata,
      stato,
      anno_validita,
      scadenza_al
    `)
    .eq('public_token', publicToken)
    .maybeSingle();

  if (tesseraError) throw new Error(tesseraError.message);
  if (!tessera) return null;

  let socio = null;

  if (tessera.socio_id) {
    const { data: socioData, error: socioError } = await supabase
      .from('soci')
      .select('id, nome, cognome, email')
      .eq('id', tessera.socio_id)
      .maybeSingle();

    if (socioError) throw new Error(socioError.message);
    socio = socioData ?? null;
  }

  const tesseraSettings = await getTesseraSettings();

  return {
    tessera,
    socio,
    tesseraSettings,
  };
}

export async function getTutorials(): Promise<TutorialRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tutorial')
    .select('id,titolo,categoria,descrizione')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function getTickets(): Promise<TicketRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('ticket_assistenza')
    .select('id,nome,cognome,email,societa,oggetto,stato')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    nominativo: `${row.nome} ${row.cognome}`,
    email: row.email,
    societa: row.societa,
    oggetto: row.oggetto,
    stato: row.stato,
  }));
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;

  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    /column|schema cache|could not find/i.test(error.message ?? '')
  );
}

function toSocioPagamento(row: any) {
  return {
    id: row.id,
    causale: row.causale,
    importo: Number(row.importo ?? 0),
    metodo: row.metodo,
    data_pagamento: row.data_pagamento ?? null,
    numero_transazione: row.numero_transazione ?? null,
    intestatario_transazione: row.intestatario_transazione ?? null,
    indirizzo: row.indirizzo ?? null,
    codice_fiscale_pagatore: row.codice_fiscale_pagatore ?? null,
    tipo_pagatore: row.tipo_pagatore ?? null,
    nota: row.nota ?? null,
    anno_quota:
      typeof row.anno_quota === 'number'
        ? row.anno_quota
        : Number(row.anno_quota ?? row.data_pagamento?.slice(0, 4) ?? new Date().getFullYear()),
    tipo_quota: row.tipo_quota ?? 'prima_iscrizione',
  };
}

export async function getSocioById(id: string): Promise<SocioDetail | null> {
  const supabase = getSupabaseClient();

  const { data: socio, error } = await supabase
    .from('soci')
    .select(`
      id,
      codice_univoco,
      nome,
      cognome,
      data_iscrizione,
      stato,
      archiviato,
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
      e_anche_volontario,
      modifica_bloccata
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Impossibile caricare il dettaglio socio: ${error.message}`);
  }

  if (!socio) return null;

  const { data: optionalSocioFields, error: optionalSocioFieldsError } = await supabase
    .from('soci')
    .select(
      'scheda_completata,richiede_verifica_volontario,nato_estero,stato_nascita,email_benvenuto_inviata_at,origine_inserimento'
    )
    .eq('id', id)
    .maybeSingle();

  if (optionalSocioFieldsError && !isMissingColumnError(optionalSocioFieldsError)) {
    throw new Error(`Impossibile caricare i dati aggiuntivi del socio: ${optionalSocioFieldsError.message}`);
  }

  const [
    { data: consensi, error: consensiError },
    { data: tutore, error: tutoreError },
    { data: pagamenti, error: pagamentiError },
  ] = await Promise.all([
    supabase
      .from('consensi_soci')
      .select(
        'consenso_prestato_da,consenso_at,privacy_accettata,statuto_accettato,trattamento_dati_associazione,consenso_minore_finalita_associazione'
      )
      .eq('socio_id', id)
      .maybeSingle(),
    supabase
      .from('tutori_soci')
      .select(
        'nome,cognome,data_nascita,luogo_nascita,provincia_nascita,codice_fiscale,indirizzo,cap,comune,provincia,telefono,email'
      )
      .eq('socio_id', id)
      .maybeSingle(),
    supabase
      .from('pagamenti_soci')
      .select(
        'id,causale,importo,metodo,data_pagamento,numero_transazione,intestatario_transazione,indirizzo,codice_fiscale_pagatore,tipo_pagatore,nota,anno_quota,tipo_quota'
      )
      .eq('socio_id', id)
      .order('created_at', { ascending: false }),
  ]);

  let safeConsensi: any = consensi;
  if (consensiError && isMissingColumnError(consensiError)) {
    const { data: fallbackConsensi, error: fallbackConsensiError } = await supabase
      .from('consensi_soci')
      .select(
        'consenso_prestato_da,consenso_at,privacy_accettata,statuto_accettato,trattamento_dati_associazione'
      )
      .eq('socio_id', id)
      .maybeSingle();

    if (fallbackConsensiError) {
      throw new Error(`Impossibile caricare i consensi del socio: ${fallbackConsensiError.message}`);
    }

    safeConsensi = fallbackConsensi
      ? { ...fallbackConsensi, consenso_minore_finalita_associazione: null }
      : null;
  } else if (consensiError) {
    throw new Error(`Impossibile caricare i consensi del socio: ${consensiError.message}`);
  }

  if (tutoreError) throw new Error(tutoreError.message);

  let safePagamenti: any[] = pagamenti ?? [];
  if (pagamentiError && isMissingColumnError(pagamentiError)) {
    const { data: fallbackPagamenti, error: fallbackPagamentiError } = await supabase
      .from('pagamenti_soci')
      .select('id,causale,importo,metodo,data_pagamento,numero_transazione,intestatario_transazione,indirizzo,nota')
      .eq('socio_id', id)
      .order('created_at', { ascending: false });

    if (fallbackPagamentiError) {
      throw new Error(`Impossibile caricare i pagamenti del socio: ${fallbackPagamentiError.message}`);
    }

    safePagamenti = fallbackPagamenti ?? [];
  } else if (pagamentiError) {
    throw new Error(`Impossibile caricare i pagamenti del socio: ${pagamentiError.message}`);
  }

  return {
    ...socio,
    scheda_completata: optionalSocioFields?.scheda_completata ?? true,
    richiede_verifica_volontario: optionalSocioFields?.richiede_verifica_volontario ?? false,
    nato_estero: optionalSocioFields?.nato_estero ?? socio.provincia_nascita === 'EE',
    stato_nascita: optionalSocioFields?.stato_nascita ?? null,
    email_benvenuto_inviata_at: optionalSocioFields?.email_benvenuto_inviata_at ?? null,
    origine_inserimento: optionalSocioFields?.origine_inserimento ?? null,
    consensi: safeConsensi ?? null,
    tutore: tutore ?? null,
    has_pagamenti: (safePagamenti ?? []).length > 0,
    pagamenti: (safePagamenti ?? []).map(toSocioPagamento),
  };
}

export async function getSocioDetail(id: string): Promise<SocioDetail | null> {
  return getSocioById(id);
}

export async function getVolontarioDetail(id: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('volontari')
    .select(`
      id,
      socio_id,
      codice_univoco,
      nome,
      cognome,
      stato,
      tipologia,
      data_inizio,
      data_cessazione,
      data_nascita,
      stato_nascita,
      luogo_nascita,
      provincia_nascita,
      stato_estero_nascita,
      codice_fiscale,
      indirizzo,
      cap,
      comune,
      provincia,
      telefono,
      email,
      minorenne,
      tutore_nome,
      tutore_cognome,
      tutore_codice_fiscale,
      tutore_telefono,
      tutore_email,
      tutore_parentela,
      tutore_indirizzo,
      tutore_cap,
      tutore_comune,
      tutore_provincia,
      modifica_bloccata
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: archivio, error: archivioError } = await supabase
  .from('archivio_volontari')
  .select('note')
  .eq('volontario_id', id)
  .order('created_at', { ascending: false })
  .maybeSingle();

if (archivioError) throw new Error(archivioError.message);

  return {
  ...data,
  nota_cessazione: archivio?.note ?? null,
};
}

export async function getPagamentoSocioReceiptData(pagamentoId: string) {
  const supabase = getSupabaseClient();

  const { data: pagamento, error: pagamentoError } = await supabase
    .from('pagamenti_soci')
    .select(`
      id,
      socio_id,
      causale,
      importo,
      metodo,
      data_pagamento,
      numero_transazione,
      intestatario_transazione,
      indirizzo,
      codice_fiscale_pagatore,
      tipo_pagatore,
      nota
    `)
    .eq('id', pagamentoId)
    .single();

  if (pagamentoError) throw new Error(pagamentoError.message);
  if (!pagamento) return null;

  const { data: socio, error: socioError } = await supabase
    .from('soci')
    .select(`
      id,
      codice_univoco,
      nome,
      cognome,
      email,
      data_iscrizione,
      e_minorenne,
      codice_fiscale
    `)
    .eq('id', pagamento.socio_id)
    .single();

  if (socioError) throw new Error(socioError.message);
  if (!socio) return null;

  const { data: tutore, error: tutoreError } = await supabase
    .from('tutori_soci')
    .select(`
      nome,
      cognome,
      codice_fiscale
    `)
    .eq('socio_id', socio.id)
    .maybeSingle();

  if (tutoreError) throw new Error(tutoreError.message);

  return {
    pagamento,
    socio,
    tutore: tutore ?? null,
  };
}

export async function getSociExportData() {
  const supabase = getSupabaseClient();

  const { data: soci, error } = await supabase
    .from('soci')
    .select(`
      id,
      codice_univoco,
      nome,
      cognome,
      stato,
      archiviato,
      data_iscrizione,
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
      e_anche_volontario,
      modifica_bloccata
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const socioIds = (soci ?? []).map((s) => s.id);

  const { data: tutori, error: tutoriError } = await supabase
    .from('tutori_soci')
    .select(`
      socio_id,
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
      email
    `)
    .in('socio_id', socioIds.length ? socioIds : ['00000000-0000-0000-0000-000000000000']);

  if (tutoriError) throw new Error(tutoriError.message);

  const { data: consensi, error: consensiError } = await supabase
    .from('consensi_soci')
    .select(`
      socio_id,
      consenso_prestato_da,
      consenso_at,
      privacy_accettata,
      statuto_accettato,
      trattamento_dati_associazione,
      consenso_minore_finalita_associazione
    `)
    .in('socio_id', socioIds.length ? socioIds : ['00000000-0000-0000-0000-000000000000']);

  if (consensiError) throw new Error(consensiError.message);

  const { data: pagamenti, error: pagamentiError } = await supabase
    .from('pagamenti_soci')
    .select(`
      socio_id,
      causale,
      importo,
      metodo,
      data_pagamento,
      numero_transazione,
      intestatario_transazione,
      indirizzo,
      codice_fiscale_pagatore,
      tipo_pagatore,
      nota
    `)
    .in('socio_id', socioIds.length ? socioIds : ['00000000-0000-0000-0000-000000000000'])
    .order('data_pagamento', { ascending: false });

  if (pagamentiError) throw new Error(pagamentiError.message);

  const tutoriMap = new Map((tutori ?? []).map((t) => [t.socio_id, t]));
  const consensiMap = new Map((consensi ?? []).map((c) => [c.socio_id, c]));
  const pagamentiMap = new Map<string, any[]>();

  for (const pagamento of pagamenti ?? []) {
    const list = pagamentiMap.get(pagamento.socio_id) ?? [];
    list.push(pagamento);
    pagamentiMap.set(pagamento.socio_id, list);
  }

  return (soci ?? []).map((socio) => {
    const tutore = tutoriMap.get(socio.id) ?? null;
    const consenso = consensiMap.get(socio.id) ?? null;
    const pagamento = (pagamentiMap.get(socio.id) ?? [])[0] ?? null;

    return {
      id: socio.id,
      codice: socio.codice_univoco,
      nome: socio.nome,
      cognome: socio.cognome,
      stato: socio.stato,
      archiviato: socio.archiviato,
      data_iscrizione: socio.data_iscrizione,
      data_nascita: socio.data_nascita,
      luogo_nascita: socio.luogo_nascita,
      provincia_nascita: socio.provincia_nascita,
      codice_fiscale: socio.codice_fiscale,
      indirizzo: socio.indirizzo,
      cap: socio.cap,
      comune: socio.comune,
      provincia: socio.provincia,
      telefono: socio.telefono,
      email: socio.email,
      minorenne: socio.e_minorenne,
      volontario: socio.e_anche_volontario,
      modifica_bloccata: socio.modifica_bloccata,

      tutore_nome: tutore?.nome ?? '',
      tutore_cognome: tutore?.cognome ?? '',
      tutore_data_nascita: tutore?.data_nascita ?? '',
      tutore_luogo_nascita: tutore?.luogo_nascita ?? '',
      tutore_provincia_nascita: tutore?.provincia_nascita ?? '',
      tutore_codice_fiscale: tutore?.codice_fiscale ?? '',
      tutore_indirizzo: tutore?.indirizzo ?? '',
      tutore_cap: tutore?.cap ?? '',
      tutore_comune: tutore?.comune ?? '',
      tutore_provincia: tutore?.provincia ?? '',
      tutore_telefono: tutore?.telefono ?? '',
      tutore_email: tutore?.email ?? '',

      consenso_prestato_da: consenso?.consenso_prestato_da ?? '',
      consenso_at: consenso?.consenso_at ?? '',
      privacy_accettata: consenso?.privacy_accettata ?? false,
      statuto_accettato: consenso?.statuto_accettato ?? false,
      trattamento_dati_associazione: consenso?.trattamento_dati_associazione ?? false,
      consenso_minore_finalita_associazione:
        consenso?.consenso_minore_finalita_associazione ?? false,

      pagamento_causale: pagamento?.causale ?? '',
      pagamento_importo: pagamento?.importo ?? '',
      pagamento_metodo: pagamento?.metodo ?? '',
      pagamento_data: pagamento?.data_pagamento ?? '',
      pagamento_numero_transazione: pagamento?.numero_transazione ?? '',
      pagamento_intestatario: pagamento?.intestatario_transazione ?? '',
      pagamento_indirizzo: pagamento?.indirizzo ?? '',
      pagamento_codice_fiscale: pagamento?.codice_fiscale_pagatore ?? '',
      pagamento_tipo_pagatore: pagamento?.tipo_pagatore ?? '',
      pagamento_nota: pagamento?.nota ?? '',
    };
  });
}

export async function getVolontariExportData() {
  const supabase = getSupabaseClient();

  const { data: volontari, error } = await supabase
    .from('volontari')
    .select(`
      id,
      socio_id,
      codice_univoco,
      nome,
      cognome,
      stato,
      tipologia,
      data_inizio,
      data_cessazione,
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
      minorenne,
      tutore_nome,
      tutore_cognome,
      tutore_codice_fiscale,
      tutore_telefono,
      tutore_email,
      tutore_parentela,
      tutore_indirizzo,
      tutore_cap,
      tutore_comune,
      tutore_provincia,
      modifica_bloccata,
      archiviato
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (volontari ?? []).map((row) => ({
    id: row.id,
    socio_id: row.socio_id,
    codice: row.codice_univoco,
    nome: row.nome,
    cognome: row.cognome,
    stato: row.stato,
    tipologia: row.tipologia,
    data_inizio: row.data_inizio,
    data_cessazione: row.data_cessazione,
    data_nascita: row.data_nascita,
    luogo_nascita: row.luogo_nascita,
    provincia_nascita: row.provincia_nascita,
    codice_fiscale: row.codice_fiscale,
    indirizzo: row.indirizzo,
    cap: row.cap,
    comune: row.comune,
    provincia: row.provincia,
    telefono: row.telefono,
    email: row.email,
    minorenne: row.minorenne,
    tutore_nome: row.tutore_nome,
    tutore_cognome: row.tutore_cognome,
    tutore_codice_fiscale: row.tutore_codice_fiscale,
    tutore_telefono: row.tutore_telefono,
    tutore_email: row.tutore_email,
    tutore_parentela: row.tutore_parentela,
    tutore_indirizzo: row.tutore_indirizzo,
    tutore_cap: row.tutore_cap,
    tutore_comune: row.tutore_comune,
    tutore_provincia: row.tutore_provincia,
    modifica_bloccata: row.modifica_bloccata,
    archiviato: row.archiviato,
  }));
}

export async function getSociAttiviPerTessera() {
  const supabase = getSupabaseClient();

  const [{ data: soci, error: sociError }, { data: tessere, error: tessereError }] =
    await Promise.all([
      supabase
        .from('soci')
        .select('id, nome, cognome, codice_univoco, email, stato, archiviato')
        .eq('stato', 'attivo')
        .eq('archiviato', false)
        .order('cognome', { ascending: true })
        .order('nome', { ascending: true }),
      supabase
        .from('tessere_digitali')
        .select('socio_id'),
    ]);

  if (sociError) throw new Error(sociError.message);
  if (tessereError) throw new Error(tessereError.message);

  const sociConTessera = new Set((tessere ?? []).map((row: any) => row.socio_id));

  return (soci ?? []).map((row: any) => ({
    id: row.id,
    nome: row.nome ?? '',
    cognome: row.cognome ?? '',
    codice_univoco: row.codice_univoco ?? '',
    email: row.email ?? '',
    ha_tessera: sociConTessera.has(row.id),
  }));
}

export async function getTesseraSettings(): Promise<TesseraSettings | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
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

  if (error) throw new Error(error.message);

  return data ?? null;
}

export async function getOrganizzazioneSettings(): Promise<OrganizzazioneSettings | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('organizzazione_settings')
    .select(`
      id,
      organizzazione_id,
      nome_associazione,
      sottotitolo_associazione,
      logo_gestionale_url,
      logo_tessera_url,
      denominazione_legale,
      codice_fiscale,
      partita_iva,
      runts_numero,
      runts_sezione,
      runts_data_iscrizione,
      indirizzo,
      cap,
      comune,
      provincia,
      email,
      pec,
      telefono,
      sito_web,
      iban,
      intestatario_conto,
      presidente_nome,
      firma_presidente_url,
      testo_ricevuta,
      ricevuta_testo_intro,
      ricevuta_testo_attestazione,
      ricevuta_testo_non_corrispettivo,
      ricevuta_testo_nota_finale,
      bollo_attivo,
      bollo_importo
    `)
    .eq('organizzazione_id', '11111111-1111-1111-1111-111111111111')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    organizzazione_id: data.organizzazione_id,
    nome_associazione: data.nome_associazione ?? '',
    sottotitolo_associazione: data.sottotitolo_associazione ?? null,
    logo_gestionale_url: data.logo_gestionale_url ?? null,
    logo_tessera_url: data.logo_tessera_url ?? null,
    denominazione_legale: data.denominazione_legale ?? null,
    codice_fiscale: data.codice_fiscale ?? null,
    partita_iva: data.partita_iva ?? null,
    runts_numero: data.runts_numero ?? null,
    runts_sezione: data.runts_sezione ?? null,
    runts_data_iscrizione: data.runts_data_iscrizione ?? null,
    indirizzo: data.indirizzo ?? null,
    cap: data.cap ?? null,
    comune: data.comune ?? null,
    provincia: data.provincia ?? null,
    email: data.email ?? null,
    pec: data.pec ?? null,
    telefono: data.telefono ?? null,
    sito_web: data.sito_web ?? null,
    iban: data.iban ?? null,
    intestatario_conto: data.intestatario_conto ?? null,
    presidente_nome: data.presidente_nome ?? null,
    firma_presidente_url: data.firma_presidente_url ?? null,
    testo_ricevuta: data.testo_ricevuta ?? null,
    ricevuta_testo_intro: data.ricevuta_testo_intro ?? null,
    ricevuta_testo_attestazione: data.ricevuta_testo_attestazione ?? null,
    ricevuta_testo_non_corrispettivo: data.ricevuta_testo_non_corrispettivo ?? null,
    ricevuta_testo_nota_finale: data.ricevuta_testo_nota_finale ?? null,
    bollo_attivo: Boolean(data.bollo_attivo),
    bollo_importo: Number(data.bollo_importo ?? 0),
  };
}
