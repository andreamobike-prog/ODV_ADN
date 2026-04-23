'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/dashboard/Modal';
import { DateSplitInput } from '@/components/form/DateSplitInput';
import type { MemberRow } from '@/lib/types';
import {
  createSocioAction,
  preparaReminderRinnoviAction,
  sospendiSociNonRinnovatiAction,
} from '@/app/(gestionale)/soci/actions';
import { getSociExportData } from '@/lib/data';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toUpperCaseValue(value: string) {
  return value.toUpperCase().trim();
}

function toLowerCaseValue(value: string) {
  return value.toLowerCase().trim();
}

type Props = {
  initialSoci: MemberRow[];
  organizzazione?: {
  nome_associazione?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  comune?: string | null;
  provincia?: string | null;
  codice_fiscale?: string | null;
  runts_numero?: string | null;
  logo_gestionale_url?: string | null;
};
};

export function SociPageClient({ initialSoci, organizzazione }: Props) {

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [codice, setCodice] = useState('');
  const [email, setEmail] = useState('');
  const [anno, setAnno] = useState('');
  const [stato, setStato] = useState('');
  const [volontario, setVolontario] = useState('');
  const [dataIscrizione, setDataIscrizione] = useState('');
  const [sezioneAttiva, setSezioneAttiva] = useState<'attivi' | 'sospesi' | 'archivio'>('attivi');
  const [showCreateModal, setShowCreateModal] = useState(false);
const [showReminderModal, setShowReminderModal] = useState(false);
const [nascitaSocio, setNascitaSocio] = useState('');
  const [reminderPreview, setReminderPreview] = useState<
    Array<{
      socioId: string;
      nome: string;
      cognome: string;
      email: string;
      codice_univoco: string;
      subject: string;
      body: string;
    }>
  >([]);

const [feedback, setFeedback] = useState<{
  error: string | null;
  success: string | null;
  loading: boolean;
}>({
  error: null,
  success: null,
  loading: false,
});

  const filtered = useMemo(() => {
    return initialSoci.filter((row) => {
      const fullName = `${row.nome} ${row.cognome}`.toLowerCase();

      const matchesSearch =
        !search || fullName.includes(search.toLowerCase());

      const matchesCodice =
        !codice ||
        String(row.codice ?? '')
          .replace(/\s+/g, '')
          .toLowerCase()
          .includes(codice.replace(/\s+/g, '').toLowerCase());

      const matchesEmail =
        !email || String(row.email ?? '').toLowerCase().includes(email.toLowerCase());

      const matchesAnno =
        !anno || String(row.data_iscrizione ?? '').startsWith(anno);

      const matchesStato = !stato || row.stato === stato;

      const matchesVolontario =
        !volontario ||
        (volontario === 'si' && !!row.volontario) ||
        (volontario === 'no' && !row.volontario);

      const matchesData =
        !dataIscrizione || row.data_iscrizione === dataIscrizione;

      const matchesSezione =
        sezioneAttiva === 'attivi'
          ? (row as any).archiviato !== true && row.stato === 'attivo'
          : sezioneAttiva === 'sospesi'
            ? (row as any).archiviato !== true && row.stato === 'sospeso'
            : (row as any).archiviato === true;

      return (
        matchesSearch &&
        matchesCodice &&
        matchesEmail &&
        matchesAnno &&
        matchesStato &&
        matchesVolontario &&
        matchesData &&
        matchesSezione
      );
    });
  }, [
    initialSoci,
    search,
    codice,
    email,
    anno,
    stato,
    volontario,
    dataIscrizione,
    sezioneAttiva,
  ]);

  async function handleCreateSocio(formData: FormData) {
    setFeedback({ error: null, success: null, loading: true });

    const nascitaTipo = String(formData.get('nascita_tipo') || '');
const comuneNascita = String(formData.get('luogo_nascita') || '').trim();
const provinciaNascitaItalia = String(formData.get('provincia_nascita') || '')
  .trim()
  .toUpperCase();
const statoNascitaEstero = String(formData.get('stato_nascita_estero') || '').trim();
const cittaNascitaEstero = String(formData.get('citta_nascita_estero') || '').trim();

const luogoNascitaFinale =
  nascitaTipo === 'estero'
    ? [cittaNascitaEstero, statoNascitaEstero].filter(Boolean).join(' - ')
    : comuneNascita;

const provinciaNascitaFinale =
  nascitaTipo === 'estero' ? 'EE' : provinciaNascitaItalia;

const payload = {
  nome: String(formData.get('nome') || ''),
  cognome: String(formData.get('cognome') || ''),
  data_nascita: String(formData.get('data_nascita') || ''),
  luogo_nascita: luogoNascitaFinale,
  provincia_nascita: provinciaNascitaFinale,
  codice_fiscale: String(formData.get('codice_fiscale') || ''),
  indirizzo: String(formData.get('indirizzo') || ''),
  cap: String(formData.get('cap') || ''),
  comune: String(formData.get('comune') || ''),
  provincia: String(formData.get('provincia') || ''),
  telefono: String(formData.get('telefono') || ''),
  email: String(formData.get('email') || ''),
  stato: String(formData.get('stato') || 'attivo'),
  data_iscrizione: String(formData.get('data_iscrizione') || ''),
  e_anche_volontario: formData.get('e_anche_volontario') === 'on',
  e_minorenne: formData.get('e_minorenne') === 'on',
};

    const result = await createSocioAction(payload);

    if (!result.ok) {
      setFeedback({ error: result.error, success: null, loading: false });
      return;
    }

    setFeedback({
      error: null,
      success: 'Socio creato correttamente.',
      loading: false,
    });

    const newSocioId =
      result.data && typeof result.data === 'object' && 'id' in result.data
        ? String(result.data.id)
        : null;

    if (newSocioId) {
      router.push(`/soci/${newSocioId}`);
      return;
    }

    setShowCreateModal(false);
    router.refresh();
  }

  async function handleSospendiNonRinnovati() {
  setFeedback({ error: null, success: null, loading: true });

  const result = await sospendiSociNonRinnovatiAction();

  if (!result.ok) {
    setFeedback({ error: result.error, success: null, loading: false });
    return;
  }

  const aggiornati =
    result.data &&
    typeof result.data === 'object' &&
    'aggiornati' in result.data &&
    typeof result.data.aggiornati === 'number'
      ? result.data.aggiornati
      : 0;

  setFeedback({
    error: null,
    success:
      aggiornati > 0
        ? `${aggiornati} soci attivi sospesi per mancato rinnovo.`
        : null,
    loading: false,
  });

  router.refresh();
}

async function handlePreparaReminderRinnovi() {
  setFeedback({ error: null, success: null, loading: true });

  const result = await preparaReminderRinnoviAction();

  if (!result.ok) {
    setFeedback({ error: result.error, success: null, loading: false });
    return;
  }

  const reminders =
    result.data &&
    typeof result.data === 'object' &&
    'reminders' in result.data &&
    Array.isArray(result.data.reminders)
      ? result.data.reminders
      : [];

  setReminderPreview(reminders);

  setFeedback({
    error: null,
    success: null,
    loading: false,
  });

  setShowReminderModal(true);
}

  async function handleExportCSV() {
    const exportRows = await getSociExportData();

    const headers = [
      'Codice socio',
      'Nome',
      'Cognome',
      'Stato',
      'Archiviato',
      'Data iscrizione',
      'Data nascita',
      'Luogo nascita',
      'Provincia nascita',
      'Codice fiscale',
      'Indirizzo',
      'CAP',
      'Comune',
      'Provincia',
      'Telefono',
      'Email',
      'Minorenne',
      'Anche volontario',
      'Modifica bloccata',
      'Tutore nome',
      'Tutore cognome',
      'Tutore data nascita',
      'Tutore luogo nascita',
      'Tutore provincia nascita',
      'Tutore codice fiscale',
      'Tutore indirizzo',
      'Tutore CAP',
      'Tutore comune',
      'Tutore provincia',
      'Tutore telefono',
      'Tutore email',
      'Consenso prestato da',
      'Consenso al',
      'Privacy accettata',
      'Statuto accettato',
      'Trattamento dati associazione',
      'Consenso minore finalità associazione',
      'Pagamento causale',
      'Pagamento importo',
      'Pagamento metodo',
      'Pagamento data',
      'Pagamento numero transazione',
      'Pagamento intestatario',
      'Pagamento indirizzo',
      'Pagamento codice fiscale',
      'Pagamento tipo pagatore',
      'Pagamento nota',
    ];

    const rows = exportRows
      .filter((row: any) => row.archiviato !== true && row.stato === 'attivo')
      .map((row: any) => [
        row.codice ?? '',
        row.nome ?? '',
        row.cognome ?? '',
        row.stato ?? '',
        row.archiviato ? 'Si' : 'No',
        row.data_iscrizione ?? '',
        row.data_nascita ?? '',
        row.luogo_nascita ?? '',
        row.provincia_nascita ?? '',
        row.codice_fiscale ?? '',
        row.indirizzo ?? '',
        row.cap ?? '',
        row.comune ?? '',
        row.provincia ?? '',
        row.telefono ?? '',
        row.email ?? '',
        row.minorenne ? 'Si' : 'No',
        row.volontario ? 'Si' : 'No',
        row.modifica_bloccata ? 'Si' : 'No',
        row.tutore_nome ?? '',
        row.tutore_cognome ?? '',
        row.tutore_data_nascita ?? '',
        row.tutore_luogo_nascita ?? '',
        row.tutore_provincia_nascita ?? '',
        row.tutore_codice_fiscale ?? '',
        row.tutore_indirizzo ?? '',
        row.tutore_cap ?? '',
        row.tutore_comune ?? '',
        row.tutore_provincia ?? '',
        row.tutore_telefono ?? '',
        row.tutore_email ?? '',
        row.consenso_prestato_da ?? '',
        row.consenso_at ?? '',
        row.privacy_accettata ? 'Si' : 'No',
        row.statuto_accettato ? 'Si' : 'No',
        row.trattamento_dati_associazione ? 'Si' : 'No',
        row.consenso_minore_finalita_associazione ? 'Si' : 'No',
        row.pagamento_causale ?? '',
        row.pagamento_importo ?? '',
        row.pagamento_metodo ?? '',
        row.pagamento_data ?? '',
        row.pagamento_numero_transazione ?? '',
        row.pagamento_intestatario ?? '',
        row.pagamento_indirizzo ?? '',
        row.pagamento_codice_fiscale ?? '',
        row.pagamento_tipo_pagatore ?? '',
        row.pagamento_nota ?? '',
      ]);

    const csvContent = [headers, ...rows]
      .map((r) =>
        r.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'libro-soci.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  async function handleExportPDF() {
  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const normalized = value.slice(0, 10);
    const [year, month, day] = normalized.split('-');
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
  };

  const soci = filtered;

    const formatBirth = (row: any) => {
    const luogo =
      row.luogo_nascita ??
      row.comune_nascita ??
      row.citta_nascita ??
      '';
    const data = formatDate(row.data_nascita);
    const cf = row.codice_fiscale ?? '';
    return [`${luogo}${luogo && data !== '—' ? ', ' : ''}${data}`, cf || '—'];
  };

  const formatAddress = (row: any) => {
    const indirizzo =
      row.indirizzo ??
      row.via ??
      row.residenza ??
      '';
    const cap = row.cap ?? '';
    const comune = row.comune ?? row.citta ?? '';
    const provincia = row.provincia ?? '';
    const riga1 = indirizzo || '—';
    const riga2 = `${cap} ${comune}${provincia ? ` (${provincia})` : ''}`.trim();
    return [riga1, riga2 || '—'];
  };

  const formatRenewalDate = (row: any) => {
    return formatDate(
      row.data_rinnovo ??
      row.data_ultimo_rinnovo ??
      row.rinnovo_il ??
      null
    );
  };

    const bodyRows = soci.map((row, index) => [
  String(index + 1),
  formatDate(row.data_iscrizione),
  `${row.cognome ?? ''} ${row.nome ?? ''}`.trim() || '—',
  `${row.luogo_nascita ?? (row as any).comune_nascita ?? (row as any).citta_nascita ?? '—'}\n${formatDate(row.data_nascita)}`,
  formatAddress(row).join('\n'),
  row.codice_fiscale || '—',
  [
    row.telefono || (row as any).cellulare || '—',
    row.email || '—',
  ].join('\n'),
  row.minorenne ? 'Sì' : 'No',
  formatRenewalDate(row),
]);

  const doc = new jsPDF('l', 'mm', 'a4');
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();

const ente = organizzazione?.nome_associazione?.trim() || '________________';

const sede = [
  organizzazione?.indirizzo?.trim() || '',
  [
    organizzazione?.cap?.trim() || '',
    organizzazione?.comune?.trim() || '',
    organizzazione?.provincia?.trim() || '',
  ]
    .filter(Boolean)
    .join(' '),
]
  .filter(Boolean)
  .join(', ') || '________________';

const cf = organizzazione?.codice_fiscale?.trim() || '________________';
const runts = organizzazione?.runts_numero?.trim() || '________________';

// FRONTESPIZIO
const logoUrl = organizzazione?.logo_gestionale_url?.trim() || '';
if (logoUrl) {
  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    doc.addImage(dataUrl, 'PNG', pageWidth - 55, 18, 22, 22);
  } catch (error) {
    console.error('Errore caricamento logo PDF:', error);
  }
}

doc.setFont('helvetica', 'bold');
doc.setFontSize(28);
doc.text('Libro soci', 25, 35);

if (logoUrl) {
  // il logo verrà aggiunto dopo il caricamento immagine
}

doc.setFont('helvetica', 'normal');
doc.setFontSize(12);
doc.text(`Ente: ${ente}`, 25, 65);
doc.text(`Sede legale: ${sede}`, 25, 75);
doc.text(`C.F.: ${cf}`, 25, 85);
doc.text(`RUNTS n. ${runts}`, 25, 95);

doc.text(
  `Libro soci generato in data ${formatDate(new Date().toISOString().slice(0, 10))}`,
  25,
  112
);

doc.text(`Numero soci presenti nel libro: ${soci.length}`, 25, 122);

doc.text(
  'Il libro si compone delle pagine successive contenenti l’elenco',
  25,
  140
);
doc.text(
  'dei soci presenti alla data di generazione del documento.',
  25,
  148
);

doc.setFont('helvetica', 'bold');
doc.text('Il Legale Rappresentante', 25, 215);

doc.setFont('helvetica', 'normal');
doc.line(25, 236, 95, 236);
doc.text('Spazio riservato alla firma digitale', 25, 243);
doc.text('e alla marcatura temporale', 25, 250);

// PAGINA TABELLA
doc.addPage();

doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.text('Libro soci', pageWidth / 2, 18, {
  align: 'center',
});

autoTable(doc, {
  startY: 26,
  head: [[
  'N.',
  'Data\niscrizione',
  'Cognome e nome',
  'Luogo e data\ndi nascita',
  'Residenza',
  'Codice fiscale',
  'Telefono\ne email',
  'Minore',
  'Data\nrinnovo',
]],
  body: bodyRows,
  theme: 'plain',
styles: {
  fontSize: 8,
  cellPadding: 2.2,
  textColor: [20, 20, 20],
  valign: 'top',
  lineWidth: 0,
},
headStyles: {
  fillColor: false,
  textColor: [20, 20, 20],
  fontStyle: 'bold',
  halign: 'left',
  valign: 'middle',
  lineWidth: 0,
},
didParseCell: (data) => {
  data.cell.styles.lineWidth = 0;
},
didDrawCell: (data) => {
  const doc = data.doc;
  const x = data.cell.x;
  const y = data.cell.y;
  const w = data.cell.width;

  if (data.section === 'head') {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.35);
    doc.line(x, y + data.cell.height, x + w, y + data.cell.height);
    return;
  }

  if (data.section === 'body') {
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.2);
    doc.line(x, y + data.cell.height, x + w, y + data.cell.height);
  }
},
  columnStyles: {
  0: { cellWidth: 10, halign: 'center' },
  1: { cellWidth: 22 },
  2: { cellWidth: 38 },
  3: { cellWidth: 28 },
  4: { cellWidth: 42 },
  5: { cellWidth: 42 },
  6: { cellWidth: 48 },
  7: { cellWidth: 14, halign: 'center' },
  8: { cellWidth: 22 },
},
});

const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Pagina ${i} di ${totalPages}`,
      pageWidth - 20,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  doc.save('libro-soci.pdf');
}

  return (
    <>
      <PageHeader
  title="Libro soci"
  subtitle="Gestione soci"
  action={
    <button
  className="button"
  type="button"
  onClick={() => {
    setNascitaSocio('');
    setShowCreateModal(true);
  }}
>
  + Aggiungi socio
</button>
  }
/>

      <div className="volontari-sezioni" style={{ paddingTop: 24, marginBottom: 28, paddingLeft: 22 }}>
  <button
    type="button"
    className={`volontari-sezione ${sezioneAttiva === 'attivi' ? 'attiva' : ''}`}
    onClick={() => setSezioneAttiva('attivi')}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
  >
    <span>Attivi</span>

    {initialSoci.filter(
      (row) =>
        row.stato === 'attivo' &&
        (row as any).archiviato !== true &&
        row.richiede_verifica_volontario
    ).length > 0 && (
      <span
        title="Soci attivi con dati da verificare nel registro volontari"
        aria-label="Soci attivi con dati da verificare nel registro volontari"
        style={{
          minWidth: 18,
          height: 18,
          padding: '0 6px',
          borderRadius: 999,
          background: '#dc2626',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: '18px',
          textAlign: 'center',
          display: 'inline-block',
        }}
      >
        {
          initialSoci.filter(
            (row) =>
              row.stato === 'attivo' &&
              (row as any).archiviato !== true &&
              row.richiede_verifica_volontario
          ).length
        }
      </span>
    )}
  </button>

  <span className="volontari-separatore">|</span>

  <button
    type="button"
    className={`volontari-sezione ${sezioneAttiva === 'sospesi' ? 'attiva' : ''}`}
    onClick={() => setSezioneAttiva('sospesi')}
  >
    Sospesi
  </button>

  <span className="volontari-separatore">|</span>

  <button
    type="button"
    className={`volontari-sezione ${sezioneAttiva === 'archivio' ? 'attiva' : ''}`}
    onClick={() => setSezioneAttiva('archivio')}
  >
    Archivio
  </button>
</div>

      {(feedback.error || feedback.success || feedback.loading) && (
        <div className="card" style={{ marginBottom: 20 }}>
          {feedback.loading && (
            <p className="muted">Salvataggio in corso...</p>
          )}
          {feedback.error && (
            <p style={{ color: '#dc2626', margin: 0 }}>{feedback.error}</p>
          )}
          {feedback.success && (
            <p style={{ color: '#16a34a', margin: 0 }}>{feedback.success}</p>
          )}
        </div>
      )}

      <div className="table-card">
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          Cerca per
        </div>

        <div
  className="filters"
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 12,
    alignItems: 'center',
  }}
>
  <input
    className="input"
    placeholder="Nome e cognome"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <input
    className="input"
    placeholder="Codice"
    value={codice}
    onChange={(e) => setCodice(e.target.value)}
  />

  <input
    className="input"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <input
    className="input"
    placeholder="Anno"
    value={anno}
    onChange={(e) => setAnno(e.target.value)}
  />

  <select
    className="select"
    defaultValue=""
    onChange={(e) => {
      const value = e.target.value;
      if (value === 'csv') handleExportCSV();
      if (value === 'pdf') handleExportPDF();
      e.target.value = '';
    }}
  >
    <option value="">Scarica</option>
    <option value="csv">CSV</option>
    <option value="pdf">PDF</option>
  </select>

  <select
  className="select"
  defaultValue=""
  disabled={feedback.loading}
  onChange={async (e) => {
    const value = e.target.value;

    if (value === 'sospendi_non_rinnovati') {
      await handleSospendiNonRinnovati();
    }

    if (value === 'prepara_reminder_rinnovi') {
      await handlePreparaReminderRinnovi();
    }

    e.target.value = '';
  }}
>
  <option value="">Azioni</option>
  <option value="sospendi_non_rinnovati">Sospendi non rinnovati</option>
  <option value="prepara_reminder_rinnovi">Prepara reminder rinnovi</option>
</select>
</div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Codice</th>
                <th>Nome e cognome</th>
                <th>Data iscrizione</th>
                <th>Email</th>
                <th>Stato</th>
                <th>Volontario</th>
                <th>Dettaglio</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
  <tr key={row.id}>
    <td>{row.codice}</td>
    <td>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>
          {row.nome} {row.cognome}
        </span>

        {row.richiede_verifica_volontario && (
          <span
            title="Questo socio ha modificato dati da verificare nel registro volontari"
            aria-label="Dati da verificare nel registro volontari"
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#dc2626',
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </td>
    <td>{row.data_iscrizione}</td>
    <td>{row.email || '—'}</td>
    <td>
      <StatusBadge value={row.stato} />
    </td>
    <td>
      {row.volontario ? (
        <StatusBadge value="Sì" />
      ) : (
        <span className="muted">No</span>
      )}
    </td>
    <td>
      <button
        className="button secondary scheda-socio-button"
        type="button"
        onClick={() => router.push(`/soci/${row.id}`)}
        title="Apri scheda socio"
        aria-label="Apri scheda socio"
      >
        <img
          src="/icons/cartella.png"
          alt="Apri scheda"
          className="custom-folder-icon"
        />
      </button>
    </td>
  </tr>
))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted">
                    Nessun socio trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showCreateModal}
        title="Aggiungi socio"
        onClose={() => setShowCreateModal(false)}
      >
        <form
          action={handleCreateSocio}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        >
          <div className="form-grid">
            <input
              className="input"
              name="nome"
              placeholder="Nome"
              required
              onBlur={(e) => {
                e.currentTarget.value = toTitleCase(e.currentTarget.value);
              }}
            />
            <input
              className="input"
              name="cognome"
              placeholder="Cognome"
              required
              onBlur={(e) => {
                e.currentTarget.value = toTitleCase(e.currentTarget.value);
              }}
            />
            <DateSplitInput name="data_nascita" required />

<select
  className="select"
  name="nascita_tipo"
  value={nascitaSocio}
  onChange={(e) => setNascitaSocio(e.target.value)}
  required
>
  <option value="">Stato di nascita: seleziona</option>
  <option value="italia">Italia</option>
  <option value="estero">Estero</option>
</select>

{nascitaSocio === 'italia' && (
  <>
    <input
      className="input"
      name="luogo_nascita"
      placeholder="Comune di nascita"
      required={nascitaSocio === 'italia'}
      onBlur={(e) => {
        e.currentTarget.value = toTitleCase(e.currentTarget.value);
      }}
    />
    <input
      className="input"
      name="provincia_nascita"
      placeholder="Provincia di nascita"
      required={nascitaSocio === 'italia'}
      maxLength={2}
      onBlur={(e) => {
        e.currentTarget.value = toUpperCaseValue(e.currentTarget.value);
      }}
    />
  </>
)}

{nascitaSocio === 'estero' && (
  <>
    <input
      className="input"
      name="stato_nascita_estero"
      placeholder="Stato estero di nascita"
      required={nascitaSocio === 'estero'}
      onBlur={(e) => {
        e.currentTarget.value = toTitleCase(e.currentTarget.value);
      }}
    />
    <input
      className="input"
      name="citta_nascita_estero"
      placeholder="Città estera di nascita"
      required={nascitaSocio === 'estero'}
      onBlur={(e) => {
        e.currentTarget.value = toTitleCase(e.currentTarget.value);
      }}
    />
    <input
      type="hidden"
      name="luogo_nascita"
      value=""
    />
    <input
      type="hidden"
      name="provincia_nascita"
      value="EE"
    />
  </>
)}
            <input
              className="input"
              name="provincia_nascita"
              placeholder="Provincia di nascita"
              required
              onBlur={(e) => {
                e.currentTarget.value = toTitleCase(e.currentTarget.value);
              }}
            />
            <input
              className="input"
              name="codice_fiscale"
              placeholder="Codice fiscale"
              required
              onBlur={(e) => {
                e.currentTarget.value = toUpperCaseValue(e.currentTarget.value);
              }}
            />
            <input
              className="input"
              name="indirizzo"
              placeholder="Via / indirizzo"
              required
              onBlur={(e) => {
                e.currentTarget.value = toTitleCase(e.currentTarget.value);
              }}
            />
            <input className="input" name="cap" placeholder="CAP" required />
            <input
              className="input"
              name="comune"
              placeholder="Comune"
              required
              onBlur={(e) => {
                e.currentTarget.value = toTitleCase(e.currentTarget.value);
              }}
            />
            <input
  className="input"
  name="provincia"
  placeholder="Provincia"
  required
  maxLength={2}
  onBlur={(e) => {
    e.currentTarget.value = e.currentTarget.value.trim().toUpperCase();
  }}
/>
            <input
              className="input"
              name="telefono"
              placeholder="Telefono"
              onBlur={(e) => {
                e.currentTarget.value = e.currentTarget.value.trim();
              }}
            />
            <input
              className="input"
              name="email"
              type="email"
              placeholder="Email"
              onBlur={(e) => {
                e.currentTarget.value = toLowerCaseValue(e.currentTarget.value);
              }}
            />
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            <label
              style={{ display: 'flex', gap: 10, alignItems: 'center' }}
            >
              <input type="checkbox" name="e_minorenne" />
              <span>Il socio è minorenne</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
            <button className="button" type="submit">
              Crea scheda
            </button>
          </div>
        </form>
      </Modal>
      <Modal
  open={showReminderModal}
  title="Anteprima reminder rinnovi"
  onClose={() => setShowReminderModal(false)}
>
  <div style={{ width: 'min(900px, 88vw)' }}>
    <div style={{ marginTop: 8, marginBottom: 16 }}>
      {reminderPreview.length > 0 ? (
        <p style={{ margin: 0 }}>
          Reminder pronti: <strong>{reminderPreview.length}</strong>
        </p>
      ) : (
        <p style={{ margin: 0 }}>Nessun reminder da preparare.</p>
      )}
    </div>

    {reminderPreview.length > 0 && (
      <div
        style={{
          overflowX: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
        }}
      >
        <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 14px' }}>Nome e cognome</th>
              <th style={{ textAlign: 'left', padding: '12px 14px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '12px 14px' }}>Codice socio</th>
              <th style={{ textAlign: 'left', padding: '12px 14px' }}>Oggetto</th>
            </tr>
          </thead>
          <tbody>
            {reminderPreview.map((item) => (
              <tr key={item.socioId}>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb' }}>
                  {item.nome} {item.cognome}
                </td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb' }}>
                  {item.email}
                </td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb' }}>
                  {item.codice_univoco}
                </td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb' }}>
                  {item.subject}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</Modal>
    </>
  );
}