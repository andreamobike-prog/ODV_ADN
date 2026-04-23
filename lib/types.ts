export type MemberStatus = 'attivo' | 'sospeso';
export type VolunteerType = 'continuativo' | 'occasionale';
export type PaymentMethod = 'paypal' | 'bonifico' | 'contanti';

export interface DashboardMetrics {
  soci: number;
  volontari: number;
  volontariOccasionali: number;
  gruppi: number;
  eventi: number;
  ticketAperti: number;
}

export interface MemberRow {
  id: string;
  codice: string;
  nome: string;
  cognome: string;
  email: string | null;
  telefono?: string | null;
  stato: MemberStatus;
  archiviato: boolean | null;
  data_iscrizione: string;
  data_nascita: string | null;
  luogo_nascita: string | null;
  provincia_nascita: string | null;
  codice_fiscale: string | null;
  indirizzo: string | null;
  cap: string | null;
  comune: string | null;
  provincia: string | null;
  minorenne: boolean | null;
  volontario?: boolean;
  modifica_bloccata: boolean | null;
  richiede_verifica_volontario?: boolean;
}

export interface VolunteerRow {
  id: string;
  codice: string;
  nome: string;
  cognome: string;
  email: string | null;
  telefono?: string | null;
  stato: MemberStatus;
  data_iscrizione: string;
  tipologia: VolunteerType;
  data_cessazione?: string | null;
  archiviato?: boolean | null;

  data_nascita?: string | null;
  luogo_nascita?: string | null;
  provincia_nascita?: string | null;
  codice_fiscale?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  comune?: string | null;
  provincia?: string | null;
  minorenne?: boolean | null;
  socio_id?: string | null;
  modifica_bloccata?: boolean | null;
  richiede_verifica_volontario?: boolean;
}

export interface GroupRow {
  id: string;
  nome: string;
  soci: number;
  volontari: number;
  totale: number;
}

export interface EventRow {
  id: string;
  nome: string;
  data_evento: string;
  descrizione: string;
  gruppi: string[];
  soci_coinvolti: number;
  volontari_coinvolti: number;
}

export interface PaymentRow {
  id: string;
  causale: string;
  importo: number;
  metodo: PaymentMethod;
  data_pagamento: string;
  numero_transazione: string;
  intestatario: string;
}

export interface DigitalCardRow {
  id: string;
  socio: string;
  codice_tessera: string;
  public_token?: string | null;
  wallet_inviato: boolean;
  email_inviata: boolean;
  stato: 'attiva' | 'scaduta' | 'revocata';
  anno_validita?: number | null;
  scadenza_al?: string | null;
  google_wallet_url?: string | null;
  apple_wallet_url?: string | null;
}

export interface TutorialRow {
  id: string;
  titolo: string;
  categoria: string;
  descrizione: string;
}

export interface TicketRow {
  id: string;
  nominativo: string;
  email: string;
  societa: string;
  oggetto: string;
  stato: 'aperto' | 'in_lavorazione' | 'chiuso';
}

export interface SocioConsensi {
  tipo_dichiarante?: 'socio' | 'tutore' | 'altro' | null;
  consenso_prestato_da: string | null;
  consenso_at: string | null;
  privacy_accettata: boolean;
  statuto_accettato: boolean;
  trattamento_dati_associazione: boolean;
  consenso_minore_finalita_associazione: boolean | null;
}

export interface SocioTutore {
  nome: string | null;
  cognome: string | null;
  data_nascita: string | null;
  luogo_nascita: string | null;
  provincia_nascita: string | null;
  codice_fiscale: string | null;
  indirizzo: string | null;
  cap: string | null;
  comune: string | null;
  provincia: string | null;
  telefono: string | null;
  email: string | null;
}

export interface SocioPagamento {
  id: string;
  causale: string;
  importo: number;
  metodo: 'paypal' | 'bonifico' | 'contanti';
  data_pagamento: string | null;
  numero_transazione: string | null;
  intestatario_transazione: string | null;
  indirizzo: string | null;
  codice_fiscale_pagatore: string | null;
  tipo_pagatore: string | null;
  nota: string | null;
  anno_quota: number;
  tipo_quota: 'prima_iscrizione' | 'rinnovo';
}

export interface SocioDetail {
  id: string;
  codice_univoco: string;
  nome: string;
  cognome: string;
  data_iscrizione: string;
  stato: MemberStatus;
  archiviato: boolean | null;
  scheda_completata: boolean;
  richiede_verifica_volontario: boolean;
  nato_estero: boolean;
  stato_nascita: string | null;
  data_nascita: string | null;
  luogo_nascita: string | null;
  provincia_nascita: string | null;
  codice_fiscale: string | null;
  indirizzo: string | null;
  cap: string | null;
  comune: string | null;
  provincia: string | null;
  telefono: string | null;
  email: string | null;
  email_benvenuto_inviata_at?: string | null;
  origine_inserimento?: string | null;
  e_minorenne: boolean;
  e_anche_volontario: boolean;
  modifica_bloccata: boolean;
  consensi: SocioConsensi | null;
  tutore: SocioTutore | null;
  has_pagamenti: boolean;
  pagamenti: SocioPagamento[];
}

export interface VolontarioDetail {
  id: string;
  socio_id: string | null;
  codice_univoco: string;
  nome: string;
  cognome: string;
  stato: MemberStatus;
  tipologia: VolunteerType;
  data_inizio: string;
  data_cessazione: string | null;
  nota_cessazione: string | null;
  data_nascita: string | null;
  luogo_nascita: string | null;
  provincia_nascita: string | null;
  codice_fiscale: string | null;
  indirizzo: string | null;
  cap: string | null;
  comune: string | null;
  provincia: string | null;
  telefono: string | null;
  email: string | null;
  minorenne: boolean | null;
  tutore_nome: string | null;
  tutore_cognome: string | null;
  tutore_codice_fiscale: string | null;
  tutore_telefono: string | null;
  tutore_email: string | null;
  tutore_parentela: string | null;
  tutore_indirizzo: string | null;
  tutore_cap: string | null;
  tutore_comune: string | null;
  tutore_provincia: string | null;
  modifica_bloccata: boolean;
}
export interface TesseraSettings {
  id: string;
  organizzazione_id: string;
  nome_associazione_tessera: string | null;
  titolo_tessera: string | null;
  etichetta_codice: string | null;
  etichetta_titolare: string | null;
  etichetta_scadenza: string | null;
  logo_url: string | null;
  immagine_centrale_url: string | null;
  colore_sfondo: string | null;
  colore_testo: string | null;
  colore_accento: string | null;
  formato_codice: string | null;
  prefisso_tessera: string | null;
  lunghezza_progressivo: number | null;
  qr_abilitato: boolean | null;
  qr_destinazione: string | null;
  qr_testo: string | null;
}
export type OrganizzazioneSettings = {
  id: string;
  organizzazione_id: string;
  nome_associazione: string;
  sottotitolo_associazione: string | null;
  logo_gestionale_url: string | null;
  logo_tessera_url: string | null;
  denominazione_legale: string | null;
  codice_fiscale: string | null;
  partita_iva: string | null;
  indirizzo: string | null;
  cap: string | null;
  comune: string | null;
  provincia: string | null;
  email: string | null;
  pec: string | null;
  telefono: string | null;
  sito_web: string | null;
  iban: string | null;
  intestatario_conto: string | null;
  presidente_nome: string | null;
  firma_presidente_url: string | null;
  testo_ricevuta: string | null;
  bollo_attivo: boolean;
  bollo_importo: number;
  runts_numero: string | null;
runts_sezione: string | null;
runts_data_iscrizione: string | null;
ricevuta_testo_intro: string | null;
ricevuta_testo_attestazione: string | null;
ricevuta_testo_non_corrispettivo: string | null;
ricevuta_testo_nota_finale: string | null;

};
