import type {
  DashboardMetrics,
  DigitalCardRow,
  EventRow,
  GroupRow,
  MemberRow,
  TicketRow,
  TutorialRow,
  VolunteerRow,
} from '@/lib/types';

export const demoMetrics: DashboardMetrics = {
  soci: 248,
  volontari: 82,
  volontariOccasionali: 19,
  gruppi: 12,
  eventi: 8,
  ticketAperti: 3,
};

export const demoSoci = [
  {
    id: '1',
    codice: 'SOC-0001',
    nome: 'Giulia',
    cognome: 'Rossi',
    email: 'giulia.rossi@example.it',
    telefono: '+39 333 1111111',
    stato: 'attivo',
    data_iscrizione: '2026-01-12',
    volontario: true,
    archiviato: false,
    data_nascita: null,
    luogo_nascita: null,
    provincia_nascita: null,
    codice_fiscale: null,
    indirizzo: null,
    cap: null,
    comune: null,
    provincia: null,
    note: null,
  },
  {
    id: '2',
    codice: 'SOC-0002',
    nome: 'Marco',
    cognome: 'Bianchi',
    email: 'marco.bianchi@example.it',
    telefono: null,
    stato: 'sospeso',
    data_iscrizione: '2025-11-03',
    volontario: false,
    archiviato: false,
    data_nascita: null,
    luogo_nascita: null,
    provincia_nascita: null,
    codice_fiscale: null,
    indirizzo: null,
    cap: null,
    comune: null,
    provincia: null,
    note: null,
  },
  {
    id: '3',
    codice: 'SOC-0003',
    nome: 'Anna',
    cognome: 'Verdi',
    email: 'anna.verdi@example.it',
    telefono: null,
    stato: 'attivo',
    data_iscrizione: '2026-02-01',
    volontario: false,
    archiviato: false,
    data_nascita: null,
    luogo_nascita: null,
    provincia_nascita: null,
    codice_fiscale: null,
    indirizzo: null,
    cap: null,
    comune: null,
    provincia: null,
  },
] as MemberRow[];

export const demoVolontari = [
  {
    id: '10',
    codice: 'VOL-0001',
    nome: 'Luca',
    cognome: 'Neri',
    email: 'luca.neri@example.it',
    stato: 'attivo',
    data_iscrizione: '2025-10-20',
    tipologia: 'continuativo',
  },
  {
    id: '11',
    codice: 'VOL-0002',
    nome: 'Elena',
    cognome: 'Gallo',
    email: 'elena.gallo@example.it',
    stato: 'attivo',
    data_iscrizione: '2026-02-18',
    tipologia: 'occasionale',
  },
] as VolunteerRow[];

export const demoGroups: GroupRow[] = [
  { id: 'g1', nome: 'Protezione Civile', soci: 22, volontari: 15, totale: 37 },
  { id: 'g2', nome: 'Eventi Solidali', soci: 35, volontari: 12, totale: 47 },
  { id: 'g3', nome: 'Logistica', soci: 11, volontari: 9, totale: 20 },
];

export const demoEvents: EventRow[] = [
  {
    id: 'e1',
    nome: 'Raccolta alimentare primavera',
    data_evento: '2026-04-11',
    descrizione: 'Evento territoriale con punti di raccolta diffusi.',
    gruppi: ['Protezione Civile', 'Logistica'],
    soci_coinvolti: 33,
    volontari_coinvolti: 24,
  },
  {
    id: 'e2',
    nome: 'Giornata del volontariato',
    data_evento: '2026-05-22',
    descrizione: 'Attività pubblica con gruppi e comunicazioni dedicate.',
    gruppi: ['Eventi Solidali'],
    soci_coinvolti: 35,
    volontari_coinvolti: 12,
  },
];

export const demoCards: DigitalCardRow[] = [
  {
    id: 'c1',
    socio: 'Giulia Rossi',
    codice_tessera: 'TESS-2026-0001',
    wallet_inviato: true,
    email_inviata: true,
    stato: 'attiva',
  },
  {
    id: 'c2',
    socio: 'Anna Verdi',
    codice_tessera: 'TESS-2026-0002',
    wallet_inviato: false,
    email_inviata: false,
    stato: 'attiva',
  },
];

export const demoTutorials: TutorialRow[] = [
  {
    id: 't1',
    titolo: 'Come creare un socio',
    categoria: 'Soci',
    descrizione: 'Panoramica del flusso da form esterno e inserimento manuale.',
  },
  {
    id: 't2',
    titolo: 'Gestione registro volontari',
    categoria: 'Volontari',
    descrizione: 'Tipologie continuativo e occasionale, cessazione e archivio.',
  },
];

export const demoTickets: TicketRow[] = [
  {
    id: 'k1',
    nominativo: 'Mario Conti',
    email: 'mario@example.it',
    societa: 'ODV Aurora',
    oggetto: 'Errore esportazione CSV',
    stato: 'aperto',
  },
  {
    id: 'k2',
    nominativo: 'Sara Lodi',
    email: 'sara@example.it',
    societa: 'ODV Aurora',
    oggetto: 'Accesso area eventi',
    stato: 'in_lavorazione',
  },
];