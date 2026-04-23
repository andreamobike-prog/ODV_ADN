'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/dashboard/Modal';
import type { VolunteerRow } from '@/lib/types';
import { createVolontarioAction } from '@/app/(gestionale)/volontari/actions';
import { DateSplitInput } from '@/components/form/DateSplitInput';
import { getVolontariExportData } from '@/lib/data';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Props = {
  initialVolontari: VolunteerRow[];
  organizzazione: {
    nome_associazione?: string | null;
    indirizzo?: string | null;
    cap?: string | null;
    comune?: string | null;
    provincia?: string | null;
    codice_fiscale?: string | null;
    runts_numero?: string | null;
    logo_gestionale_url?: string | null;
  } | null;
};

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trimStart()
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
}

function normalizeInputValue(name: string, value: string) {
  if (name === 'codice_fiscale') return value.toUpperCase();
  if (name === 'email') return value.toLowerCase();
  if (name.includes('data')) return value;
  if (name === 'cap') return value;
  if (name === 'telefono') return value;
  return toTitleCase(value);
}

export function VolontariPageClient({
  initialVolontari,
  organizzazione,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [cf, setCf] = useState('');
  const [email, setEmail] = useState('');
  const [anno, setAnno] = useState('');
  const [statoNascita, setStatoNascita] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedback, setFeedback] = useState<{
    error: string | null;
    success: string | null;
    loading: boolean;
  }>({
    error: null,
    success: null,
    loading: false,
  });

  const [sezioneAttiva, setSezioneAttiva] = useState<
    'continuativi' | 'occasionali' | 'archivio'
  >('continuativi');

  const filtered = useMemo(() => {
    return initialVolontari.filter((row) => {
      const fullName = `${row.nome ?? ''} ${row.cognome ?? ''}`.toLowerCase();
      const rowCf = String((row as any).codice_fiscale ?? '').toLowerCase();
      const rowEmail = String(row.email ?? '').toLowerCase();
      const annoRow = String((row as any).data_iscrizione ?? '').slice(0, 4);

      const matchesSearch = !search || fullName.includes(search.toLowerCase());
      const matchesCf = !cf || rowCf.includes(cf.toLowerCase());
      const matchesEmail = !email || rowEmail.includes(email.toLowerCase());
      const matchesAnno = !anno || annoRow.includes(anno);

      const matchesSezione =
  sezioneAttiva === 'continuativi'
    ? (row as any).archiviato !== true &&
      row.tipologia === 'continuativo' &&
      row.stato === 'attivo'
    : sezioneAttiva === 'occasionali'
      ? (row as any).archiviato !== true &&
        row.tipologia === 'occasionale' &&
        row.stato === 'attivo'
      : (row as any).archiviato === true &&
        row.stato !== 'attivo';

      return (
        matchesSearch &&
        matchesCf &&
        matchesEmail &&
        matchesAnno &&
        matchesSezione
      );
    });
  }, [initialVolontari, search, cf, email, anno, sezioneAttiva]);

  async function handleCreateVolontario(formData: FormData) {
    setFeedback({ error: null, success: null, loading: true });

    const statoNascita = String(formData.get('stato_nascita') || '').toLowerCase();

    const comuneNascita = String(formData.get('comune_nascita') || '').trim();

    const provinciaNascita = String(formData.get('provincia_nascita') || '')
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 2);

    const cittaEsteraNascita = String(
      formData.get('citta_estera_nascita') || ''
    ).trim();

    const statoEsteroNascita = String(
      formData.get('stato_estero_nascita') || ''
    ).trim();

    const provinciaResidenza = String(formData.get('provincia') || '')
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 2);

    const payload = {
      nome: String(formData.get('nome') || ''),
      cognome: String(formData.get('cognome') || ''),
      data_nascita: String(formData.get('data_nascita') || ''),
      stato_nascita: statoNascita,
      luogo_nascita:
        statoNascita === 'estero' ? cittaEsteraNascita : comuneNascita,
      provincia_nascita: statoNascita === 'estero' ? '' : provinciaNascita,
      stato_estero_nascita:
        statoNascita === 'estero' ? statoEsteroNascita : '',
      codice_fiscale: String(formData.get('codice_fiscale') || ''),
      indirizzo: String(formData.get('indirizzo') || ''),
      cap: String(formData.get('cap') || ''),
      comune: String(formData.get('comune') || ''),
      provincia: provinciaResidenza,
      telefono: String(formData.get('telefono') || ''),
      email: String(formData.get('email') || ''),
      minorenne: formData.get('minorenne') === 'on',
    };

    const result = await createVolontarioAction(payload);

    if (!result.ok) {
      setFeedback({ error: result.error, success: null, loading: false });
      return;
    }

    setFeedback({ error: null, success: null, loading: false });
    setShowCreateModal(false);
    setStatoNascita('');
    router.push(`/volontari/${(result.data as any).id}`);
  }

  async function handleExportCSVContinuativi() {
    const exportRows = await getVolontariExportData();

    const headers = [
      'Codice volontario',
      'Nome',
      'Cognome',
      'Stato',
      'Tipologia',
      'Archiviato',
      'Data inizio',
      'Data cessazione',
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
      'Socio collegato',
      'Modifica bloccata',
      'Tutore nome',
      'Tutore cognome',
      'Tutore codice fiscale',
      'Tutore telefono',
      'Tutore email',
      'Tutore parentela',
      'Tutore indirizzo',
      'Tutore CAP',
      'Tutore comune',
      'Tutore provincia',
    ];

    const rows = exportRows
      .filter(
        (row: any) =>
          row.archiviato !== true &&
          row.stato === 'attivo' &&
          row.tipologia === 'continuativo'
      )
      .map((row: any) => [
        row.codice ?? '',
        row.nome ?? '',
        row.cognome ?? '',
        row.stato ?? '',
        row.tipologia ?? '',
        row.archiviato ? 'Si' : 'No',
        row.data_inizio ?? '',
        row.data_cessazione ?? '',
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
        row.socio_id ? 'Si' : 'No',
        row.modifica_bloccata ? 'Si' : 'No',
        row.tutore_nome ?? '',
        row.tutore_cognome ?? '',
        row.tutore_codice_fiscale ?? '',
        row.tutore_telefono ?? '',
        row.tutore_email ?? '',
        row.tutore_parentela ?? '',
        row.tutore_indirizzo ?? '',
        row.tutore_cap ?? '',
        row.tutore_comune ?? '',
        row.tutore_provincia ?? '',
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
    link.setAttribute('download', 'registro-volontari-continuativi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

async function handleExportCSVOccasionali() {
  const exportRows = await getVolontariExportData();

  const headers = [
    'Codice volontario',
    'Nome',
    'Cognome',
    'Stato',
    'Tipologia',
    'Archiviato',
    'Data inizio',
    'Data cessazione',
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
    'Socio collegato',
    'Modifica bloccata',
    'Tutore nome',
    'Tutore cognome',
    'Tutore codice fiscale',
    'Tutore telefono',
    'Tutore email',
    'Tutore parentela',
    'Tutore indirizzo',
    'Tutore CAP',
    'Tutore comune',
    'Tutore provincia',
  ];

  const rows = exportRows
    .filter((row: any) => row.archiviato !== true && row.stato === 'attivo' && row.tipologia === 'occasionale')
    .map((row: any) => [
      row.codice ?? '',
      row.nome ?? '',
      row.cognome ?? '',
      row.stato ?? '',
      row.tipologia ?? '',
      row.archiviato ? 'Si' : 'No',
      row.data_inizio ?? '',
      row.data_cessazione ?? '',
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
      row.socio_id ? 'Si' : 'No',
      row.modifica_bloccata ? 'Si' : 'No',
      row.tutore_nome ?? '',
      row.tutore_cognome ?? '',
      row.tutore_codice_fiscale ?? '',
      row.tutore_telefono ?? '',
      row.tutore_email ?? '',
      row.tutore_parentela ?? '',
      row.tutore_indirizzo ?? '',
      row.tutore_cap ?? '',
      row.tutore_comune ?? '',
      row.tutore_provincia ?? '',
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
  link.setAttribute('download', 'registro-volontari-occasionali.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
async function handleExportPDFContinuativi() {
  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const normalized = value.slice(0, 10);
    const [year, month, day] = normalized.split('-');
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
  };

  const toNormalCase = (value?: string | null) => {
    if (!value) return '';
    return String(value)
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const exportRows = await getVolontariExportData();

  const volontari = exportRows.filter(
    (row: any) => row.tipologia === 'continuativo'
  );

  const formatBirth = (row: any) => {
    const luogo =
      row.luogo_nascita ??
      row.comune_nascita ??
      row.citta_nascita ??
      '';
    const data = formatDate(row.data_nascita);
    const cf = row.codice_fiscale ?? '';
    return [
      `${toNormalCase(luogo)}${luogo && data !== '—' ? ', ' : ''}${data}`,
      cf || '—',
    ];
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
    const riga1 = toNormalCase(indirizzo) || '—';
    const riga2 = `${cap} ${toNormalCase(comune)}${provincia ? ` (${String(provincia).toUpperCase()})` : ''}`.trim();
    return [riga1, riga2 || '—'];
  };

  const bodyRows = volontari.map((row: any, index: number) => [
    String(index + 1),
    formatDate(row.data_inizio),
    `${toNormalCase(row.cognome)} ${toNormalCase(row.nome)}`.trim() || '—',
    formatBirth(row).join('\n'),
    formatAddress(row).join('\n'),
    row.data_cessazione ? formatDate(row.data_cessazione) : '—',
  ]);

  const doc = new jsPDF('p', 'mm', 'a4');
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
const runts = organizzazione?.runts_numero?.trim() || '';

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

      doc.addImage(dataUrl, 'PNG', pageWidth - 45, 18, 18, 18);
    } catch (error) {
      console.error('Errore caricamento logo PDF registro volontari:', error);
    }
  }

  doc.setFont('helvetica', 'bold');
doc.setFontSize(24);
doc.text('Registro dei volontari continuativi', 25, 52);

doc.setFont('helvetica', 'normal');
doc.setFontSize(12);
doc.text(`Ente: ${ente}`, 25, 78);
doc.text(`Sede legale: ${sede}`, 25, 88);
doc.text(`C.F.: ${cf}`, 25, 98);

if (runts) {
  doc.text(`RUNTS n. ${runts}`, 25, 108);
}

const infoY = runts ? 125 : 115;
const testoRegistroY = infoY + 28;

doc.text(
  `Registro generato in data ${formatDate(new Date().toISOString().slice(0, 10))}`,
  25,
  infoY
);

doc.text(
  `Numero volontari continuativi iscritti nel registro: ${volontari.length}`,
  25,
  infoY + 10
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
  doc.text('Registro dei volontari continuativi', pageWidth / 2, 18, {
    align: 'center',
  });

  autoTable(doc, {
    startY: 26,
    head: [[
      'N.',
      'Data\nammissione',
      'Cognome e nome',
      'Luogo e data di nascita\nCodice fiscale',
      'Residenza',
      'Data\ncancellazione',
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
      2: { cellWidth: 34 },
      3: { cellWidth: 48 },
      4: { cellWidth: 52 },
      5: { cellWidth: 22, halign: 'center' },
    },
    margin: { left: 10, right: 10 },
  });

  const totalPages = doc.getNumberOfPages();
const pagineRegistro = Math.max(totalPages - 1, 1);
const dataCreazione = formatDate(new Date().toISOString().slice(0, 10));

doc.setPage(1);
doc.setFont('helvetica', 'normal');
doc.setFontSize(12);
doc.text(
  `Il registro si compone di ${pagineRegistro} pagine oltre la copertina del registro.`,
  25,
  testoRegistroY
);
doc.text(
  'Le pagine successive contengono l’elenco dei volontari continuativi iscritti nel registro',
  25,
  testoRegistroY + 8
);
doc.text(
  'alla data di generazione del documento.',
  25,
  testoRegistroY + 16
);

for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text(
    `Creato il ${dataCreazione}`,
    25,
    pageHeight - 10
  );

  doc.text(
    `Pagina ${i} di ${totalPages}`,
    pageWidth - 20,
    pageHeight - 10,
    { align: 'right' }
  );
}

doc.save('registro-volontari-continuativi.pdf');
}

async function handleExportPDFOccasionali() {
  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const normalized = value.slice(0, 10);
    const [year, month, day] = normalized.split('-');
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
  };

  const toNormalCase = (value?: string | null) => {
    if (!value) return '';
    return String(value)
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const exportRows = await getVolontariExportData();

  const volontari = exportRows.filter(
    (row: any) =>
      row.tipologia === 'occasionale' &&
      row.archiviato !== true &&
      row.stato === 'attivo'
  );

  const formatBirth = (row: any) => {
    const luogo =
      row.luogo_nascita ??
      row.comune_nascita ??
      row.citta_nascita ??
      '';
    const data = formatDate(row.data_nascita);
    return `${toNormalCase(luogo)}${luogo && data !== '-' ? ', ' : ''}${data}` || '-';
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
    const riga1 = toNormalCase(indirizzo) || '-';
    const riga2 = `${cap} ${toNormalCase(comune)}${provincia ? ` (${String(provincia).toUpperCase()})` : ''}`.trim();
    return [riga1, riga2 || '-'];
  };

  const bodyRows = volontari.map((row: any, index: number) => [
    String(index + 1),
    formatDate(row.data_inizio),
    `${toNormalCase(row.cognome)} ${toNormalCase(row.nome)}`.trim() || '-',
    [formatBirth(row), row.codice_fiscale || '-'].join('\n'),
    formatAddress(row).join('\n'),
  ]);

  const doc = new jsPDF('p', 'mm', 'a4');
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
  const runts = organizzazione?.runts_numero?.trim() || '';
  const dataCreazione = formatDate(new Date().toISOString().slice(0, 10));

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

      doc.addImage(dataUrl, 'PNG', pageWidth - 45, 18, 18, 18);
    } catch (error) {
      console.error('Errore caricamento logo PDF registro volontari occasionali:', error);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Elenco dei volontari occasionali', 25, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Ente: ${ente}`, 25, 78);
  doc.text(`Sede legale: ${sede}`, 25, 88);
  doc.text(`C.F.: ${cf}`, 25, 98);

  if (runts) {
    doc.text(`RUNTS n. ${runts}`, 25, 108);
  }

  const infoY = runts ? 125 : 115;
  const testoElencoY = infoY + 28;

  doc.text(`Elenco generato in data ${dataCreazione}`, 25, infoY);
  doc.text(
    `Numero volontari occasionali presenti nell'elenco: ${volontari.length}`,
    25,
    infoY + 10
  );

  doc.addPage();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Elenco dei volontari occasionali', pageWidth / 2, 18, {
    align: 'center',
  });

  autoTable(doc, {
    startY: 26,
    head: [[
      'N.',
      'Data\nattivita',
      'Cognome e nome',
      'Luogo e data di nascita\nCodice fiscale',
      'Residenza',
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
      1: { cellWidth: 24 },
      2: { cellWidth: 38 },
      3: { cellWidth: 54 },
      4: { cellWidth: 64 },
    },
    margin: { left: 10, right: 10 },
  });

  const totalPages = doc.getNumberOfPages();
  const pagineElenco = Math.max(totalPages - 1, 1);

  doc.setPage(1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(
    `L'elenco si compone di ${pagineElenco} pagine oltre la copertina del documento.`,
    25,
    testoElencoY
  );
  doc.text(
    'Le pagine successive contengono la lista completa dei volontari occasionali presenti',
    25,
    testoElencoY + 8
  );
  doc.text(
    'alla data di generazione del documento.',
    25,
    testoElencoY + 16
  );

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text(`Creato il ${dataCreazione}`, 25, pageHeight - 10);
    doc.text(`Pagina ${i} di ${totalPages}`, pageWidth - 20, pageHeight - 10, {
      align: 'right',
    });
  }

  doc.save('elenco-volontari-occasionali.pdf');
}
  return (
    <>
      <PageHeader
        title="Registro volontari"
        subtitle="Gestione volontari continuativi e occasionali"
        action={
          <button
  type="button"
  className="button"
  onClick={() => {
    setStatoNascita('');
    setShowCreateModal(true);
  }}
>
  + Aggiungi volontario
</button>
        }
      />

      {(feedback.error || feedback.success || feedback.loading) && (
        <div className="card" style={{ marginBottom: 20 }}>
          {feedback.loading && <p className="muted">Salvataggio in corso...</p>}
          {feedback.error && <p style={{ color: '#dc2626', margin: 0 }}>{feedback.error}</p>}
          {feedback.success && <p style={{ color: '#16a34a', margin: 0 }}>{feedback.success}</p>}
        </div>
      )}

      <div className="table-card">
        <div className="volontari-sezioni">
  <button
    type="button"
    className={`volontari-sezione ${sezioneAttiva === 'continuativi' ? 'attiva' : ''}`}
    onClick={() => setSezioneAttiva('continuativi')}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
  >
    <span>Continuativi</span>

    {initialVolontari.filter(
      (row) =>
        row.tipologia === 'continuativo' &&
        row.stato === 'attivo' &&
        (row as any).archiviato !== true &&
        row.richiede_verifica_volontario
    ).length > 0 && (
      <span
        title="Volontari continuativi con dati socio da verificare"
        aria-label="Volontari continuativi con dati socio da verificare"
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
          initialVolontari.filter(
            (row) =>
              row.tipologia === 'continuativo' &&
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
    className={`volontari-sezione ${sezioneAttiva === 'occasionali' ? 'attiva' : ''}`}
    onClick={() => setSezioneAttiva('occasionali')}
  >
    Occasionali
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

        <div className="filters-block">
          <h2 className="filters-title">Cerca per</h2>

          <div className="filters filters-volontari">
            <input
              className="input"
              placeholder="Nome/Cognome"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              className="input"
              placeholder="CF"
              value={cf}
              onChange={(e) => setCf(e.target.value)}
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

    if (value === 'csv-continuativi') {
      handleExportCSVContinuativi();
    }

    if (value === 'csv-occasionali') {
      handleExportCSVOccasionali();
    }
    if (value === 'pdf-continuativi') {
  handleExportPDFContinuativi();
}

  if (value === 'pdf-occasionali') {
  handleExportPDFOccasionali();
  }

    e.currentTarget.value = '';
  }}
>
  <option value="">Scarica</option>
  <option value="csv-continuativi">CSV Continuativi</option>
  <option value="csv-occasionali">CSV Occasionali</option>
  <option value="pdf-continuativi">PDF Continuativi</option>
  <option value="pdf-occasionali">PDF Occasionali</option>
</select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
  <tr>
    <th>N.</th>
    <th>Nome e Cognome</th>
    <th>Data inizio</th>
    <th>Codice Fiscale</th>
    <th>Stato</th>
    <th>Dettaglio</th>
  </tr>
</thead>

            <tbody>
  {filtered.map((row, index) => (
    <tr key={row.id}>
      <td>{String(index + 1).padStart(2, '0')}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>
            {row.nome} {row.cognome}
          </span>

          {row.richiede_verifica_volontario && (
            <span
              title="Dati socio aggiornati da verificare nel registro volontari"
              aria-label="Dati socio aggiornati da verificare nel registro volontari"
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
      <td>{(row as any).data_iscrizione || '—'}</td>
      <td>{(row as any).codice_fiscale || '—'}</td>
      <td className="stato-cell">
  {sezioneAttiva === 'archivio' ? (
    row.tipologia === 'occasionale' ? (
      <span
        style={{
          display: 'inline-block',
          padding: '6px 10px',
          borderRadius: 0,
          background: '#eee8f6',
          color: '#6b5a8e',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        archiviato
      </span>
    ) : (
      <span>archiviato</span>
    )
  ) : (
    <StatusBadge value={row.stato} />
  )}
</td>
      <td>
        <button
          className="button secondary scheda-socio-button"
          type="button"
          onClick={() => router.push(`/volontari/${row.id}`)}
          title="Apri scheda volontario"
          aria-label="Apri scheda volontario"
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
</tbody>
          </table>
        </div>
      </div>

      <Modal
  open={showCreateModal}
  title="Aggiungi volontario"
  onClose={() => {
    setShowCreateModal(false);
    setStatoNascita('');
  }}
>
  <form
    action={handleCreateVolontario}
    onInput={(e) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement;
      if (!target.name) return;
      if (target.tagName === 'SELECT') return;
      if (target.type === 'checkbox') return;
      target.value = normalizeInputValue(target.name, target.value);
    }}
    onKeyDown={(e) => {
      const target = e.target as HTMLElement;
      if (e.key === 'Enter' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    }}
        >
          <div className="form-grid volontario-form-grid">
  <input className="input" name="nome" placeholder="Nome" required />
  <input className="input" name="cognome" placeholder="Cognome" required />

  <DateSplitInput name="data_nascita" required />

  <select
    className="input"
    name="stato_nascita"
    value={statoNascita}
    onChange={(e) => setStatoNascita(e.currentTarget.value)}
    required
  >
    <option value="" disabled>
      Stato di nascita
    </option>
    <option value="italia">Italia</option>
    <option value="estero">Estero</option>
  </select>

  {statoNascita === 'italia' && (
    <>
      <input
        className="input"
        name="comune_nascita"
        placeholder="Comune di nascita"
        required
      />

      <input
        className="input"
        name="provincia_nascita"
        placeholder="Provincia di nascita"
        required
        maxLength={2}
        onBlur={(e) => {
          e.currentTarget.value = e.currentTarget.value
            .replace(/[^a-zA-Z]/g, '')
            .toUpperCase()
            .slice(0, 2);
        }}
      />
    </>
  )}

  {statoNascita === 'estero' && (
    <>
      <input
        className="input"
        name="stato_estero_nascita"
        placeholder="Stato di nascita"
        required
      />

      <input
        className="input"
        name="citta_estera_nascita"
        placeholder="Città di nascita"
        required
      />
    </>
  )}

  <input className="input" name="codice_fiscale" placeholder="Codice fiscale" required />

  <input className="input" name="indirizzo" placeholder="Via / indirizzo" required />
  <input className="input" name="cap" placeholder="CAP" required />

  <input className="input" name="comune" placeholder="Comune" required />
  <input
    className="input"
    name="provincia"
    placeholder="Provincia"
    required
    maxLength={2}
    onBlur={(e) => {
      e.currentTarget.value = e.currentTarget.value
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 2);
    }}
  />

  <input className="input" name="telefono" placeholder="Telefono" />
  <input className="input" name="email" type="email" placeholder="Email" />

  <label className="checkbox-field">
    <input type="checkbox" name="minorenne" />
    <span>Il volontario è minorenne</span>
  </label>
</div>

          <div className="volontario-modal-actions">
            <button className="button" type="submit">
              Crea scheda
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}