'use client';

import { StatusToggle } from '@/components/soci/StatusToggle';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import {
  archiviaSocioAction,
  createPagamentoSocioAction,
  ripristinaSocioAction,
  saveConsensiSocioAction,
  saveTutoreSocioAction,
  toggleSocioStatusAction,
  updateSocioAction,
} from '@/app/(gestionale)/soci/actions';
import type { SocioDetail } from '@/lib/types';
import { DateSplitInput } from '@/components/form/DateSplitInput';
import { VolunteerToggle } from '@/components/soci/VolunteerToggle';
import { Modal } from '@/components/dashboard/Modal';
import { AppleWalletButton } from '@/components/wallet/AppleWalletButton';
import { Mail } from 'lucide-react';

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

export function SocioDetailClient({ socio }: { socio: SocioDetail }) {
  const router = useRouter();

  const [feedback, setFeedback] = useState<{
    error: string | null;
    success: string | null;
    loading: boolean;
  }>({
    error: null,
    success: null,
    loading: false,
  });

  const [showSavedIcon, setShowSavedIcon] = useState(false);
const [showArchiviaModal, setShowArchiviaModal] = useState(false);
const [showRipristinaModal, setShowRipristinaModal] = useState(false);
const [showChiudiModal, setShowChiudiModal] = useState(false);
const [showAttivaModal, setShowAttivaModal] = useState(false);
const [showRinnovoModal, setShowRinnovoModal] = useState(false);

const [nascitaSocio, setNascitaSocio] = useState(
  socio.provincia_nascita === 'EE' ? 'estero' : 'italia'
);
const [nascitaTutore, setNascitaTutore] = useState(
  socio.tutore?.provincia_nascita === 'EE' ? 'estero' : 'italia'
);

const [tipoPagatore, setTipoPagatore] = useState<'socio' | 'tutore' | 'altro'>(
  socio.e_minorenne ? 'tutore' : 'socio'
);

const intestatarioPagamento =
  tipoPagatore === 'socio'
    ? `${socio.nome} ${socio.cognome}`.trim()
    : tipoPagatore === 'tutore'
      ? `${socio.tutore?.nome ?? ''} ${socio.tutore?.cognome ?? ''}`.trim()
      : '';

const indirizzoPagamento =
  tipoPagatore === 'socio'
    ? [
        socio.indirizzo ?? '',
        socio.cap ?? '',
        socio.comune ?? '',
        socio.provincia ?? '',
      ]
        .filter(Boolean)
        .join(', ')
    : tipoPagatore === 'tutore'
      ? [
          socio.tutore?.indirizzo ?? '',
          socio.tutore?.cap ?? '',
          socio.tutore?.comune ?? '',
          socio.tutore?.provincia ?? '',
        ]
          .filter(Boolean)
          .join(', ')
      : '';

const codiceFiscalePagamento =
  tipoPagatore === 'socio'
    ? socio.codice_fiscale ?? ''
    : tipoPagatore === 'tutore'
      ? socio.tutore?.codice_fiscale ?? ''
      : '';

const [intestatarioAltro, setIntestatarioAltro] = useState('');
const [indirizzoAltro, setIndirizzoAltro] = useState('');
const [codiceFiscaleAltro, setCodiceFiscaleAltro] = useState('');

const annoCorrente = new Date().getFullYear();

const anniQuotaRegistrati = Array.from(
  new Set(
    socio.pagamenti
      .map((p: any) => p.anno_quota)
      .filter((value: unknown): value is number => typeof value === 'number')
  )
).sort((a, b) => a - b);

const ultimoAnnoQuotaRegistrato =
  anniQuotaRegistrati.length > 0
    ? anniQuotaRegistrati[anniQuotaRegistrati.length - 1]
    : null;

const annoProssimoRinnovo =
  ultimoAnnoQuotaRegistrato && ultimoAnnoQuotaRegistrato >= annoCorrente
    ? ultimoAnnoQuotaRegistrato + 1
    : annoCorrente;

const quotaAnnoProssimoRinnovoGiaPresente =
  anniQuotaRegistrati.includes(annoProssimoRinnovo);

const [annoRinnovo, setAnnoRinnovo] = useState<number>(annoProssimoRinnovo);
const [importoRinnovo, setImportoRinnovo] = useState<string>(
  socio.e_minorenne ? '20.00' : '30.00'
);
const [dataPagamentoRinnovo, setDataPagamentoRinnovo] = useState(
  new Date().toISOString().slice(0, 10)
);

const schedaInBozza =
  socio.stato === 'sospeso' &&
  !(socio as any).archiviato &&
  !socio.scheda_completata;

const consensiModificabili = schedaInBozza;
const pagamentoModificabile = schedaInBozza;
const datiModificabili = schedaInBozza;

const puoRegistrareRinnovo =
  socio.scheda_completata &&
  !(socio as any).archiviato &&
  !quotaAnnoProssimoRinnovoGiaPresente;

  const mailBenvenutoInviata = Boolean((socio as any).email_benvenuto_inviata_at);

  async function handleUpdateSocio(formData: FormData) {
    setFeedback({ error: null, success: null, loading: true });

    const result = await updateSocioAction({
      socioId: socio.id,
nome: String(formData.get('nome') || ''),
cognome: String(formData.get('cognome') || ''),
data_nascita: String(formData.get('data_nascita') || ''),
luogo_nascita:
  String(formData.get('nascita_tipo') || '') === 'estero'
    ? [
        String(formData.get('citta_nascita_estero') || '').trim(),
        String(formData.get('stato_nascita_estero') || '').trim(),
      ]
        .filter(Boolean)
        .join(' - ')
    : String(formData.get('luogo_nascita') || ''),
provincia_nascita:
  String(formData.get('nascita_tipo') || '') === 'estero'
    ? 'EE'
    : String(formData.get('provincia_nascita') || '').trim().toUpperCase(),
codice_fiscale: String(formData.get('codice_fiscale') || ''),
indirizzo: String(formData.get('indirizzo') || ''),
cap: String(formData.get('cap') || ''),
comune: String(formData.get('comune') || ''),
provincia: String(formData.get('provincia') || ''),
telefono: String(formData.get('telefono') || ''),
email: String(formData.get('email') || ''),
e_anche_volontario: false,
e_minorenne: socio.e_minorenne,
    });

    if (!result.ok) {
      setFeedback({ error: result.error, success: null, loading: false });
      return;
    }

    setFeedback({ error: null, success: null, loading: false });
    setShowSavedIcon(true);

    setTimeout(() => {
      setShowSavedIcon(false);
      router.refresh();
    }, 1000);
  }

  async function handleSaveConsensi(formData: FormData) {
    setFeedback({ error: null, success: null, loading: true });

    const result = await saveConsensiSocioAction({
      socioId: socio.id,
      consenso_prestato_da: '',
      consenso_at: '',
      privacy_accettata: formData.get('privacy_accettata') === 'on',
      statuto_accettato: formData.get('statuto_accettato') === 'on',
      trattamento_dati_associazione:
        formData.get('trattamento_dati_associazione') === 'on',
      consenso_minore_finalita_associazione:
        formData.get('consenso_minore_finalita_associazione') === 'on',
    });

    if (!result.ok) {
      setFeedback({ error: result.error, success: null, loading: false });
      return;
    }

    setFeedback({
      error: null,
      success: 'Consensi salvati.',
      loading: false,
    });
    router.refresh();
  }

  async function handleSaveTutore(formData: FormData) {
    setFeedback({ error: null, success: null, loading: true });

    const result = await saveTutoreSocioAction({
      socioId: socio.id,
nome: String(formData.get('nome') || ''),
cognome: String(formData.get('cognome') || ''),
data_nascita: String(formData.get('data_nascita') || ''),
luogo_nascita:
  String(formData.get('nascita_tipo') || '') === 'estero'
    ? [
        String(formData.get('citta_nascita_estero') || '').trim(),
        String(formData.get('stato_nascita_estero') || '').trim(),
      ]
        .filter(Boolean)
        .join(' - ')
    : String(formData.get('luogo_nascita') || ''),
provincia_nascita:
  String(formData.get('nascita_tipo') || '') === 'estero'
    ? 'EE'
    : String(formData.get('provincia_nascita') || '').trim().toUpperCase(),
codice_fiscale: String(formData.get('codice_fiscale') || ''),
indirizzo: String(formData.get('indirizzo') || ''),
cap: String(formData.get('cap') || ''),
comune: String(formData.get('comune') || ''),
provincia: String(formData.get('provincia') || ''),
telefono: String(formData.get('telefono') || ''),
email: String(formData.get('email') || ''),
    });

    if (!result.ok) {
      setFeedback({ error: result.error, success: null, loading: false });
      return;
    }

    setFeedback({
      error: null,
      success: 'Tutore salvato.',
      loading: false,
    });
    router.refresh();
  }

  async function handleArchiviaSocio() {
  setFeedback({ error: null, success: null, loading: true });

  const result = await archiviaSocioAction({
    socioId: socio.id,
  });

  if (!result.ok) {
    setFeedback({ error: result.error, success: null, loading: false });
    return;
  }

  router.push('/soci');
}

  async function handleRipristinaSocio() {
  setFeedback({ error: null, success: null, loading: true });

  const result = await ripristinaSocioAction({
    socioId: socio.id,
  });

  if (!result.ok) {
    setFeedback({ error: result.error, success: null, loading: false });
    return;
  }

  router.push('/soci');
}

  async function handleChiudiInSospesi() {
    const socioForm = document.getElementById('form-dati-socio') as HTMLFormElement | null;

    if (!socioForm) {
      router.push('/soci');
      return;
    }

    const formData = new FormData(socioForm);

    setFeedback({ error: null, success: null, loading: true });

    const result = await updateSocioAction({
      socioId: socio.id,
nome: String(formData.get('nome') || ''),
cognome: String(formData.get('cognome') || ''),
data_nascita: String(formData.get('data_nascita') || ''),
luogo_nascita:
  String(formData.get('nascita_tipo') || '') === 'estero'
    ? [
        String(formData.get('citta_nascita_estero') || '').trim(),
        String(formData.get('stato_nascita_estero') || '').trim(),
      ]
        .filter(Boolean)
        .join(' - ')
    : String(formData.get('luogo_nascita') || ''),
provincia_nascita:
  String(formData.get('nascita_tipo') || '') === 'estero'
    ? 'EE'
    : String(formData.get('provincia_nascita') || '').trim().toUpperCase(),
codice_fiscale: String(formData.get('codice_fiscale') || ''),
indirizzo: String(formData.get('indirizzo') || ''),
cap: String(formData.get('cap') || ''),
comune: String(formData.get('comune') || ''),
provincia: String(formData.get('provincia') || ''),
telefono: String(formData.get('telefono') || ''),
email: String(formData.get('email') || ''),
e_anche_volontario: false,
e_minorenne: socio.e_minorenne,
    });

    if (!result.ok) {
      setFeedback({ error: result.error, success: null, loading: false });
      return;
    }

    const consensiForm = document.getElementById('form-consensi') as HTMLFormElement | null;

    if (consensiForm) {
      const consensiFormData = new FormData(consensiForm);

      const consensiResult = await saveConsensiSocioAction({
        socioId: socio.id,
        consenso_prestato_da: '',
        consenso_at: '',
        privacy_accettata: consensiFormData.get('privacy_accettata') === 'on',
        statuto_accettato: consensiFormData.get('statuto_accettato') === 'on',
        trattamento_dati_associazione:
          consensiFormData.get('trattamento_dati_associazione') === 'on',
        consenso_minore_finalita_associazione:
          consensiFormData.get('consenso_minore_finalita_associazione') === 'on',
      });

      if (!consensiResult.ok) {
        setFeedback({
          error: consensiResult.error,
          success: null,
          loading: false,
        });
        return;
      }
    }

    router.push('/soci');
  }
  async function handleSalvaEAttivaSocio() {
  const socioForm = document.getElementById('form-dati-socio') as HTMLFormElement | null;
  const tutoreForm = document.getElementById('form-dati-tutore') as HTMLFormElement | null;
  const consensiForm = document.getElementById('form-consensi') as HTMLFormElement | null;
  const pagamentoForm = document.getElementById('form-pagamento-socio') as HTMLFormElement | null;

  if (!socioForm || !consensiForm || !pagamentoForm) return;

  if (!socioForm.checkValidity()) {
    socioForm.reportValidity();
    return;
  }

  if (socio.e_minorenne && tutoreForm && !tutoreForm.checkValidity()) {
    tutoreForm.reportValidity();
    return;
  }

  if (!consensiForm.checkValidity()) {
    consensiForm.reportValidity();
    return;
  }

  if (!pagamentoForm.checkValidity()) {
    pagamentoForm.reportValidity();
    return;
  }

  const socioData = new FormData(socioForm);
  const consensiData = new FormData(consensiForm);
  const pagamentoData = new FormData(pagamentoForm);

  setFeedback({ error: null, success: null, loading: true });

  const socioResult = await updateSocioAction({
    socioId: socio.id,
nome: String(socioData.get('nome') || ''),
cognome: String(socioData.get('cognome') || ''),
data_nascita: String(socioData.get('data_nascita') || ''),
luogo_nascita:
  String(socioData.get('nascita_tipo') || '') === 'estero'
    ? [
        String(socioData.get('citta_nascita_estero') || '').trim(),
        String(socioData.get('stato_nascita_estero') || '').trim(),
      ]
        .filter(Boolean)
        .join(' - ')
    : String(socioData.get('luogo_nascita') || ''),
provincia_nascita:
  String(socioData.get('nascita_tipo') || '') === 'estero'
    ? 'EE'
    : String(socioData.get('provincia_nascita') || '').trim().toUpperCase(),
codice_fiscale: String(socioData.get('codice_fiscale') || ''),
indirizzo: String(socioData.get('indirizzo') || ''),
cap: String(socioData.get('cap') || ''),
comune: String(socioData.get('comune') || ''),
provincia: String(socioData.get('provincia') || ''),
telefono: String(socioData.get('telefono') || ''),
email: String(socioData.get('email') || ''),
e_anche_volontario: false,
e_minorenne: socio.e_minorenne,
  });

  if (!socioResult.ok) {
    setFeedback({ error: socioResult.error, success: null, loading: false });
    return;
  }

  if (socio.e_minorenne && tutoreForm) {
    const tutoreData = new FormData(tutoreForm);

    const tutoreResult = await saveTutoreSocioAction({
      socioId: socio.id,
nome: String(tutoreData.get('nome') || ''),
cognome: String(tutoreData.get('cognome') || ''),
data_nascita: String(tutoreData.get('data_nascita') || ''),
luogo_nascita:
  String(tutoreData.get('nascita_tipo') || '') === 'estero'
    ? [
        String(tutoreData.get('citta_nascita_estero') || '').trim(),
        String(tutoreData.get('stato_nascita_estero') || '').trim(),
      ]
        .filter(Boolean)
        .join(' - ')
    : String(tutoreData.get('luogo_nascita') || ''),
provincia_nascita:
  String(tutoreData.get('nascita_tipo') || '') === 'estero'
    ? 'EE'
    : String(tutoreData.get('provincia_nascita') || '').trim().toUpperCase(),
codice_fiscale: String(tutoreData.get('codice_fiscale') || ''),
indirizzo: String(tutoreData.get('indirizzo') || ''),
cap: String(tutoreData.get('cap') || ''),
comune: String(tutoreData.get('comune') || ''),
provincia: String(tutoreData.get('provincia') || ''),
telefono: String(tutoreData.get('telefono') || ''),
email: String(tutoreData.get('email') || ''),
    });

    if (!tutoreResult.ok) {
      setFeedback({ error: tutoreResult.error, success: null, loading: false });
      return;
    }
  }

  const consensiResult = await saveConsensiSocioAction({
    socioId: socio.id,
    consenso_prestato_da: '',
    consenso_at: '',
    privacy_accettata: consensiData.get('privacy_accettata') === 'on',
    statuto_accettato: consensiData.get('statuto_accettato') === 'on',
    trattamento_dati_associazione:
      consensiData.get('trattamento_dati_associazione') === 'on',
    consenso_minore_finalita_associazione:
      consensiData.get('consenso_minore_finalita_associazione') === 'on',
  });

  if (!consensiResult.ok) {
    setFeedback({ error: consensiResult.error, success: null, loading: false });
    return;
  }

  const dataPagamento = String(pagamentoData.get('data_pagamento') || '');
const annoQuota = Number(
  (dataPagamento || new Date().toISOString().slice(0, 10)).slice(0, 4)
);

const pagamentoResult = await createPagamentoSocioAction({
  socioId: socio.id,
  causale: String(pagamentoData.get('causale') || ''),
  importo: Number(pagamentoData.get('importo') || 0),
  metodo: String(pagamentoData.get('metodo') || 'contanti') as
    | 'paypal'
    | 'bonifico'
    | 'contanti',
  data_pagamento: dataPagamento,
  numero_transazione: String(pagamentoData.get('numero_transazione') || ''),
  intestatario_transazione: String(
    pagamentoData.get('intestatario_transazione') || ''
  ),
  indirizzo: String(pagamentoData.get('indirizzo') || ''),
  codice_fiscale_pagatore: String(
    pagamentoData.get('codice_fiscale_pagatore') || ''
  ),
  tipo_pagatore: tipoPagatore,
  nota: String(pagamentoData.get('nota') || ''),
  anno_quota: annoQuota,
  tipo_quota: 'prima_iscrizione',
});

  if (!pagamentoResult.ok) {
    setFeedback({ error: pagamentoResult.error, success: null, loading: false });
    return;
  }

  const statusResult = await toggleSocioStatusAction({
  socioId: socio.id,
  stato: 'attivo',
});

if (!statusResult.ok) {
  alert(statusResult.error);
  setFeedback({ error: statusResult.error, success: null, loading: false });
  return;
}

  setFeedback({ error: null, success: null, loading: false });
  router.push('/soci');
}
async function handleRinnovoQuota(formData: FormData) {
  setFeedback({ error: null, success: null, loading: true });

  const annoQuota = Number(formData.get('anno_quota') || 0);

  const result = await createPagamentoSocioAction({
    socioId: socio.id,
    causale: String(formData.get('causale') || ''),
    importo: Number(formData.get('importo') || 0),
    metodo: String(formData.get('metodo') || 'contanti') as
      | 'paypal'
      | 'bonifico'
      | 'contanti',
    data_pagamento: String(formData.get('data_pagamento') || ''),
    numero_transazione: String(formData.get('numero_transazione') || ''),
    intestatario_transazione: String(
      formData.get('intestatario_transazione') || ''
    ),
    indirizzo: String(formData.get('indirizzo') || ''),
    codice_fiscale_pagatore: String(
      formData.get('codice_fiscale_pagatore') || ''
    ),
    tipo_pagatore: String(formData.get('tipo_pagatore') || tipoPagatore),
    nota: String(formData.get('nota') || ''),
    anno_quota: annoQuota,
    tipo_quota: 'rinnovo',
  });

  if (!result.ok) {
    setFeedback({ error: result.error, success: null, loading: false });
    return;
  }

  const statusResult = await toggleSocioStatusAction({
    socioId: socio.id,
    stato: 'attivo',
  });

  if (!statusResult.ok) {
    setFeedback({ error: statusResult.error, success: null, loading: false });
    return;
  }

  setShowRinnovoModal(false);
  setFeedback({ error: null, success: null, loading: false });
  router.refresh();
}
  return (
    <>
      <PageHeader
  title={`${socio.nome} ${socio.cognome}`}
  subtitle={`Codice socio: ${socio.codice_univoco}`}
  action={
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {(socio as any).archiviato ? (
        <button
          type="button"
          className="button secondary"
          onClick={() => setShowRipristinaModal(true)}
        >
          Ripristina
        </button>
      ) : socio.stato === 'sospeso' ? (
        <button
          type="button"
          className="button secondary"
          onClick={() => setShowArchiviaModal(true)}
        >
          Archivia
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => setShowChiudiModal(true)}
        aria-label="Chiudi scheda socio"
        title="Chiudi scheda socio"
        style={{
          width: 56,
          height: 56,
          border: 'none',
          background: '#eee8f6',
          color: '#9082a9',
          fontSize: 34,
          fontWeight: 500,
          lineHeight: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
    </div>
  }
/>

{(feedback.error || feedback.loading) && (
  <div className="card" style={{ marginBottom: 20 }}>
    {feedback.loading && <p className="muted">Salvataggio in corso...</p>}
    {feedback.error && (
      <p style={{ color: '#dc2626', margin: 0 }}>{feedback.error}</p>
    )}
  </div>
)}

{socio.richiede_verifica_volontario && (
  <div
    className="card"
    style={{
      marginBottom: 20,
      border: '1px solid #fecaca',
      background: '#fef2f2',
    }}
  >
    <p style={{ margin: 0, color: '#991b1b', fontWeight: 600 }}>
      Attenzione: questo socio ha aggiornato dati di contatto o residenza.
      Verifica l’allineamento nel registro volontari.
    </p>
  </div>
)}

<div className="grid-2">
  <div className="card">
    <div className="eyebrow">Intestazione scheda</div>
    <p>
      <strong>Nome e cognome:</strong> {socio.nome} {socio.cognome}
    </p>
    <p>
      <strong>Codice univoco:</strong> {socio.codice_univoco}
    </p>
    <p>
      <strong>Data iscrizione:</strong> {socio.data_iscrizione}
    </p>
    <AppleWalletButton type="member" id={socio.id} />
    <div style={{ display: 'grid', gap: 10 }}>
      <strong>Stato socio</strong>
      <StatusToggle socioId={socio.id} stato={socio.stato} />
    </div>
  </div>

  <div className="card">
    <div className="eyebrow">Flag principali</div>
    <p>
      <strong>Minorenne:</strong> {socio.e_minorenne ? 'Sì' : 'No'}
    </p>
    <p>
      <strong>Anche volontario:</strong> {socio.e_anche_volontario ? 'Sì' : 'No'}
    </p>
    <p>
      <strong>Modifica bloccata:</strong> {socio.modifica_bloccata ? 'Sì' : 'No'}
    </p>
    <p>
      <strong>Verifica volontario:</strong>{' '}
      {socio.richiede_verifica_volontario ? 'Sì' : 'No'}
    </p>

    <div>
  <div style={{ fontWeight: 700, marginBottom: 10 }}>
    Volontario Attivo
  </div>

  <VolunteerToggle
    socioId={socio.id}
    isVolunteer={!!socio.e_anche_volontario}
  />
</div>
  </div>
</div>

      <div className="card" style={{ marginTop: 24 }}>
  <div className="eyebrow">Dati socio</div>

  {datiModificabili ? (
    <form id="form-dati-socio" action={handleUpdateSocio}>
      <div className="form-grid">
        <input
          className="input"
          name="nome"
          defaultValue={socio.nome}
          required
          onBlur={(e) => {
            e.currentTarget.value = toTitleCase(e.currentTarget.value);
          }}
        />
        <input
          className="input"
          name="cognome"
          defaultValue={socio.cognome}
          required
          onBlur={(e) => {
            e.currentTarget.value = toTitleCase(e.currentTarget.value);
          }}
        />
        <DateSplitInput
  name="data_nascita"
  value={socio.data_nascita ?? ''}
  required
/>

<select
  className="select"
  name="nascita_tipo"
  value={nascitaSocio}
  onChange={(e) => setNascitaSocio(e.target.value)}
  required
>
  <option value="italia">Italia</option>
  <option value="estero">Estero</option>
</select>

{nascitaSocio === 'italia' ? (
  <>
    <input
      className="input"
      name="luogo_nascita"
      defaultValue={socio.provincia_nascita === 'EE' ? '' : socio.luogo_nascita ?? ''}
      placeholder="Comune di nascita"
      required={nascitaSocio === 'italia'}
      onBlur={(e) => {
        e.currentTarget.value = toTitleCase(e.currentTarget.value);
      }}
    />
    <input
      className="input"
      name="provincia_nascita"
      defaultValue={socio.provincia_nascita === 'EE' ? '' : socio.provincia_nascita ?? ''}
      placeholder="Provincia di nascita"
      required={nascitaSocio === 'italia'}
      maxLength={2}
      onBlur={(e) => {
        e.currentTarget.value = toUpperCaseValue(e.currentTarget.value);
      }}
    />
  </>
) : (
  <>
    <input
      className="input"
      name="stato_nascita_estero"
      defaultValue={socio.provincia_nascita === 'EE' ? (socio.luogo_nascita?.split(' - ')[1] ?? '') : ''}
      placeholder="Stato estero di nascita"
      required={nascitaSocio === 'estero'}
      onBlur={(e) => {
        e.currentTarget.value = toTitleCase(e.currentTarget.value);
      }}
    />
    <input
      className="input"
      name="citta_nascita_estero"
      defaultValue={socio.provincia_nascita === 'EE' ? (socio.luogo_nascita?.split(' - ')[0] ?? '') : ''}
      placeholder="Città estera di nascita"
      required={nascitaSocio === 'estero'}
      onBlur={(e) => {
        e.currentTarget.value = toTitleCase(e.currentTarget.value);
      }}
    />
    <input type="hidden" name="luogo_nascita" value="" />
    <input type="hidden" name="provincia_nascita" value="EE" />
  </>
)}
        <input
          className="input"
          name="codice_fiscale"
          defaultValue={socio.codice_fiscale ?? ''}
          required
          onBlur={(e) => {
            e.currentTarget.value = toUpperCaseValue(e.currentTarget.value);
          }}
        />
        <input
          className="input"
          name="indirizzo"
          defaultValue={socio.indirizzo ?? ''}
          required
          onBlur={(e) => {
            e.currentTarget.value = toTitleCase(e.currentTarget.value);
          }}
        />
        <input
          className="input"
          name="cap"
          defaultValue={socio.cap ?? ''}
          required
          placeholder="CAP"
        />
        <input
          className="input"
          name="comune"
          defaultValue={socio.comune ?? ''}
          required
          onBlur={(e) => {
            e.currentTarget.value = toTitleCase(e.currentTarget.value);
          }}
        />
        <input
          className="input"
          name="provincia"
          defaultValue={socio.provincia ?? ''}
          required
          onBlur={(e) => {
            e.currentTarget.value = toTitleCase(e.currentTarget.value);
          }}
        />
        <input
          className="input"
          name="telefono"
          defaultValue={socio.telefono ?? ''}
          required
          onBlur={(e) => {
            e.currentTarget.value = e.currentTarget.value.trim();
          }}
        />
        <input
          className="input"
          name="email"
          defaultValue={socio.email ?? ''}
          required
          onBlur={(e) => {
            e.currentTarget.value = toLowerCaseValue(e.currentTarget.value);
          }}
        />
      </div>
    </form>
  ) : (
    <div className="form-grid">
      <input className="input" value={socio.nome ?? ''} readOnly />
      <input className="input" value={socio.cognome ?? ''} readOnly />
      <input className="input" value={socio.data_nascita ?? ''} readOnly />
      <input className="input" value={socio.luogo_nascita ?? ''} readOnly />
      <input className="input" value={socio.provincia_nascita ?? ''} readOnly />
      <input className="input" value={socio.codice_fiscale ?? ''} readOnly />
      <input className="input" value={socio.indirizzo ?? ''} readOnly />
      <input className="input" value={socio.cap ?? ''} readOnly />
      <input className="input" value={socio.comune ?? ''} readOnly />
      <input className="input" value={socio.provincia ?? ''} readOnly />
      <input className="input" value={socio.telefono ?? ''} readOnly />
      <input className="input" value={socio.email ?? ''} readOnly />
    </div>
  )}
</div>

      {socio.e_minorenne && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="eyebrow">Dati tutore</div>
          <form id="form-dati-tutore" action={handleSaveTutore}>
            <div className="form-grid">
              <input
                className="input"
                name="nome"
                defaultValue={socio.tutore?.nome ?? ''}
                placeholder="Nome"
                required
                onBlur={(e) => {
                  e.currentTarget.value = toTitleCase(e.currentTarget.value);
                }}
              />
              <input
                className="input"
                name="cognome"
                defaultValue={socio.tutore?.cognome ?? ''}
                placeholder="Cognome"
                required
                onBlur={(e) => {
                  e.currentTarget.value = toTitleCase(e.currentTarget.value);
                }}
              />
              <DateSplitInput
  name="data_nascita"
  value={socio.tutore?.data_nascita ?? ''}
  required
/>

<select
  className="select"
  name="nascita_tipo"
  value={nascitaTutore}
  onChange={(e) => setNascitaTutore(e.target.value)}
  required
>
  <option value="italia">Italia</option>
  <option value="estero">Estero</option>
</select>

{nascitaTutore === 'italia' ? (
  <>
    <input
      className="input"
      name="luogo_nascita"
      defaultValue={
        socio.tutore?.provincia_nascita === 'EE' ? '' : socio.tutore?.luogo_nascita ?? ''
      }
      placeholder="Comune di nascita"
      required={nascitaTutore === 'italia'}
      onBlur={(e) => {
        e.currentTarget.value = toTitleCase(e.currentTarget.value);
      }}
    />
    <input
      className="input"
      name="provincia_nascita"
      defaultValue={
        socio.tutore?.provincia_nascita === 'EE' ? '' : socio.tutore?.provincia_nascita ?? ''
      }
      placeholder="Provincia di nascita"
      required={nascitaTutore === 'italia'}
      maxLength={2}
      onBlur={(e) => {
        e.currentTarget.value = toUpperCaseValue(e.currentTarget.value);
      }}
    />
  </>
) : (
  <>
    <input
      className="input"
      name="stato_nascita_estero"
      defaultValue={
        socio.tutore?.provincia_nascita === 'EE'
          ? (socio.tutore?.luogo_nascita?.split(' - ')[1] ?? '')
          : ''
      }
      placeholder="Stato estero di nascita"
      required={nascitaTutore === 'estero'}
      onBlur={(e) => {
        e.currentTarget.value = toTitleCase(e.currentTarget.value);
      }}
    />
    <input
      className="input"
      name="citta_nascita_estero"
      defaultValue={
        socio.tutore?.provincia_nascita === 'EE'
          ? (socio.tutore?.luogo_nascita?.split(' - ')[0] ?? '')
          : ''
      }
      placeholder="Città estera di nascita"
      required={nascitaTutore === 'estero'}
      onBlur={(e) => {
        e.currentTarget.value = toTitleCase(e.currentTarget.value);
      }}
    />
    <input type="hidden" name="luogo_nascita" value="" />
    <input type="hidden" name="provincia_nascita" value="EE" />
  </>
)}
              <input
                className="input"
                name="codice_fiscale"
                defaultValue={socio.tutore?.codice_fiscale ?? ''}
                placeholder="Codice fiscale"
                required
                onBlur={(e) => {
                  e.currentTarget.value = toUpperCaseValue(e.currentTarget.value);
                }}
              />
              <input
                className="input"
                name="indirizzo"
                defaultValue={socio.tutore?.indirizzo ?? ''}
                placeholder="Indirizzo"
                required
                onBlur={(e) => {
                  e.currentTarget.value = toTitleCase(e.currentTarget.value);
                }}
              />
              <input
                className="input"
                name="cap"
                defaultValue={socio.tutore?.cap ?? ''}
                placeholder="CAP"
                required
              />
              <input
                className="input"
                name="comune"
                defaultValue={socio.tutore?.comune ?? ''}
                placeholder="Comune"
                required
                onBlur={(e) => {
                  e.currentTarget.value = toTitleCase(e.currentTarget.value);
                }}
              />
              <input
                className="input"
                name="provincia"
                defaultValue={socio.tutore?.provincia ?? ''}
                placeholder="Provincia"
                required
                onBlur={(e) => {
                  e.currentTarget.value = toTitleCase(e.currentTarget.value);
                }}
              />
              <input
                className="input"
                name="telefono"
                defaultValue={socio.tutore?.telefono ?? ''}
                placeholder="Telefono"
                required
                onBlur={(e) => {
                  e.currentTarget.value = e.currentTarget.value.trim();
                }}
              />
              <input
                className="input"
                name="email"
                defaultValue={socio.tutore?.email ?? ''}
                placeholder="Email"
                required
                onBlur={(e) => {
                  e.currentTarget.value = toLowerCaseValue(e.currentTarget.value);
                }}
              />
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginTop: 24 }}>
        <div className="eyebrow">Consensi</div>
        <form id="form-consensi" action={handleSaveConsensi}>
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
  {socio.e_minorenne ? (
    <>
      {consensiModificabili ? (
        <>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              name="privacy_accettata"
              defaultChecked={!!socio.consensi?.privacy_accettata}
              required
            />
            <span>Dichiaro di essere il tutore legale del minore</span>
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              name="statuto_accettato"
              defaultChecked={!!socio.consensi?.statuto_accettato}
              required
            />
            <span>
              Dichiaro di aver letto e accettato l’informativa Privacy per conto del minore
            </span>
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              name="trattamento_dati_associazione"
              defaultChecked={!!socio.consensi?.trattamento_dati_associazione}
              required
            />
            <span>
              Dichiaro di aver letto e accettato lo Statuto e il Regolamento dell’associazione
            </span>
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              name="consenso_minore_finalita_associazione"
              defaultChecked={!!socio.consensi?.consenso_minore_finalita_associazione}
              required
            />
            <span>
              Acconsento al trattamento dei dati del minore per finalità associative e per la gestione del Registro Volontari
            </span>
          </label>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: '#111' }}>
              {socio.consensi?.privacy_accettata ? '✔' : '□'}
            </span>
            <span>Dichiaro di essere il tutore legale del minore</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: '#111' }}>
              {socio.consensi?.statuto_accettato ? '✔' : '□'}
            </span>
            <span>
              Dichiaro di aver letto e accettato l’informativa Privacy per conto del minore
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: '#111' }}>
              {socio.consensi?.trattamento_dati_associazione ? '✔' : '□'}
            </span>
            <span>
              Dichiaro di aver letto e accettato lo Statuto e il Regolamento dell’associazione
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: '#111' }}>
              {socio.consensi?.consenso_minore_finalita_associazione ? '✔' : '□'}
            </span>
            <span>
              Acconsento al trattamento dei dati del minore per finalità associative e per la gestione del Registro Volontari
            </span>
          </div>
        </>
      )}
    </>
  ) : (
    <>
      {consensiModificabili ? (
        <>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              name="privacy_accettata"
              defaultChecked={!!socio.consensi?.privacy_accettata}
              required
            />
            <span>Ha letto e accettato l’informativa privacy</span>
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              name="statuto_accettato"
              defaultChecked={!!socio.consensi?.statuto_accettato}
              required
            />
            <span>Ha letto e accettato statuto e regolamento</span>
          </label>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              name="trattamento_dati_associazione"
              defaultChecked={!!socio.consensi?.trattamento_dati_associazione}
              required
            />
            <span>Consente al trattamento dati per finalità associative</span>
          </label>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: '#111' }}>
              {socio.consensi?.privacy_accettata ? '✔' : '□'}
            </span>
            <span>Ha letto e accettato l’informativa privacy</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: '#111' }}>
              {socio.consensi?.statuto_accettato ? '✔' : '□'}
            </span>
            <span>Ha letto e accettato statuto e regolamento</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: '#111' }}>
              {socio.consensi?.trattamento_dati_associazione ? '✔' : '□'}
            </span>
            <span>Consente al trattamento dati per finalità associative</span>
          </div>
        </>
      )}
    </>
  )}
</div>
        </form>
      </div>
    {pagamentoModificabile && (
      <div className="card" style={{ marginTop: 24 }}>
        <div className="eyebrow">Dati pagamento</div>
        <form
          id="form-pagamento-socio"
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
            e.preventDefault();
            }
          }}
        >
          <div className="form-grid">
            <input
  className="input"
  name="causale"
  value="Quota associativa"
  readOnly
/>

            <>
              <input
                className="input"
                type="text"
                value={socio.e_minorenne ? '20,00' : '30,00'}
                readOnly
              />
              <input
                type="hidden"
                name="importo"
                value={socio.e_minorenne ? '20.00' : '30.00'}
              />
            </>

            <select
              className="select"
              name="metodo"
              defaultValue="contanti"
              required
            >
              <option value="paypal">PayPal</option>
              <option value="bonifico">Bonifico</option>
              <option value="contanti">Contanti</option>
            </select>

            <input
              className="input"
              name="data_pagamento"
              type="date"
              required
            />

            <select
              className="select"
              value={tipoPagatore}
              onChange={(e) =>
                setTipoPagatore(e.target.value as 'socio' | 'tutore' | 'altro')
              }
            >
              {!socio.e_minorenne && <option value="socio">Chi paga: socio</option>}
              {socio.e_minorenne && <option value="tutore">Chi paga: tutore legale</option>}
              <option value="altro">Chi paga: altra persona</option>
            </select>

            <input
              className="input"
              name="numero_transazione"
              placeholder="Numero transazione"
            />

            <input
              className="input"
              name="intestatario_transazione"
              placeholder="Intestatario ricevuta"
              required={tipoPagatore === 'altro'}
              value={tipoPagatore === 'altro' ? intestatarioAltro : intestatarioPagamento}
              readOnly={tipoPagatore !== 'altro'}
              onChange={(e) => {
                if (tipoPagatore === 'altro') {
                  setIntestatarioAltro(e.target.value);
                }
              }}
            />

            <input
              className="input"
              name="indirizzo"
              placeholder="Indirizzo"
              required={tipoPagatore === 'altro'}
              value={tipoPagatore === 'altro' ? indirizzoAltro : indirizzoPagamento}
              readOnly={tipoPagatore !== 'altro'}
              onChange={(e) => {
                if (tipoPagatore === 'altro') {
                  setIndirizzoAltro(e.target.value);
                }
              }}
            />

            <input
              className="input"
              name="codice_fiscale_pagatore"
              placeholder="Codice fiscale"
              required={tipoPagatore === 'altro'}
              value={tipoPagatore === 'altro' ? codiceFiscaleAltro : codiceFiscalePagamento}
              readOnly={tipoPagatore !== 'altro'}
              onChange={(e) => {
                if (tipoPagatore === 'altro') {
                  setCodiceFiscaleAltro(toUpperCaseValue(e.target.value));
                }
              }}
            />

            <textarea
              className="textarea"
              name="nota"
              placeholder="Nota modificabile"
            />
          </div>

          <div className="save-action-row">
            <button
                className="button"
                type="button"
                disabled={feedback.loading}
                onClick={() => setShowAttivaModal(true)}
              >
              {feedback.loading ? 'SALVATAGGIO...' : 'SALVA E ATTIVA SOCIO'}
            </button>

            {showSavedIcon && (
              <span
                className="save-success-icon"
                aria-label="Salvataggio completato"
                title="Salvato"
              >
                ✓
              </span>
            )}
          </div>
        </form>
      </div>
    )}

      <div className="table-card" style={{ marginTop: 24 }}>
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    }}
  >
    <div className="eyebrow" style={{ marginBottom: 0 }}>
      Storico pagamenti
    </div>

    {puoRegistrareRinnovo && (
  <button
    type="button"
    className="button"
    onClick={() => setShowRinnovoModal(true)}
  >
    + Registra rinnovo quota
  </button>
)}
  </div>

  <div className="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Causale</th>
          <th>Importo</th>
          <th>Data</th>
          <th>Intestatario</th>
          <th>Ricevuta</th>
        </tr>
      </thead>
      <tbody>
        {socio.pagamenti.map((p) => (
          <tr key={p.id}>
            <td>{p.causale}</td>
            <td>{p.importo}</td>
            <td>{p.data_pagamento ?? '—'}</td>
            <td>{p.intestatario_transazione ?? '—'}</td>
            <td>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}
  >
    <button
      type="button"
      className="button secondary scheda-socio-button"
      title="Apri ricevuta"
      aria-label="Apri ricevuta"
      onClick={() => window.open(`/soci/ricevuta/${p.id}`, '_blank')}
    >
      <img
        src="/icons/cartella.png"
        alt="Apri ricevuta"
        className="custom-folder-icon"
      />
    </button>

    {mailBenvenutoInviata ? (
  <span
    title="Mail di conferma inviata"
    aria-label="Mail di conferma inviata"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 6,
      color: '#9082a9',
    }}
  >
    <Mail size={26} strokeWidth={1.9} />
  </span>
) : null}
    
  </div>
</td>
          </tr>
        ))}
        {socio.pagamenti.length === 0 && (
          <tr>
            <td colSpan={5} className="muted">
              Nessun pagamento registrato.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
      <Modal
  open={showArchiviaModal}
  title="Archiviare il socio?"
  onClose={() => setShowArchiviaModal(false)}
>
  <p style={{ marginTop: 0 }}>
    Sei sicura di voler archiviare questo socio? Il socio resterà nello storico
    e potrà essere ripristinato in Sospesi.
  </p>

  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
    <button
      type="button"
      className="button"
      onClick={async () => {
        setShowArchiviaModal(false);
        await handleArchiviaSocio();
      }}
    >
      Conferma
    </button>
  </div>
</Modal>
<Modal
  open={showRipristinaModal}
  title="Ripristinare il socio?"
  onClose={() => setShowRipristinaModal(false)}
>
  <p style={{ marginTop: 0 }}>
    Sei sicura di voler ripristinare questo socio? Verrà riportato in Sospesi.
  </p>

  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
    <button
      type="button"
      className="button"
      onClick={async () => {
        setShowRipristinaModal(false);
        await handleRipristinaSocio();
      }}
    >
      Conferma
    </button>
  </div>
</Modal>
<Modal
  open={showChiudiModal}
  title="Chiudere la scheda?"
  onClose={() => setShowChiudiModal(false)}
>
  <p style={{ marginTop: 0 }}>
    {socio.stato === 'attivo'
      ? 'La scheda verrà chiusa. Vuoi continuare?'
      : 'La scheda verrà chiusa e salvata in Sospesi. Potrai recuperarla e completarla in un secondo momento.'}
  </p>

  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
    <button
      type="button"
      className="button"
      onClick={async () => {
        setShowChiudiModal(false);

        if (socio.stato === 'attivo') {
          router.push('/soci');
          return;
        }

        await handleChiudiInSospesi();
      }}
    >
      Conferma
    </button>
  </div>
</Modal>
<Modal
  open={showAttivaModal}
  title="Attivare il nuovo socio?"
  onClose={() => setShowAttivaModal(false)}
>
  <p style={{ marginTop: 0 }}>
    Sei sicura di voler attivare il nuovo socio? Confermando, verranno salvati
    i dati, i consensi, il pagamento e il socio sarà inserito tra gli Attivi.
  </p>

  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
    <button
  type="button"
  className="button"
  onClick={async () => {
    setShowAttivaModal(false);
    await handleSalvaEAttivaSocio();
  }}
>
  Conferma
</button>
  </div>
</Modal>
<Modal
  open={showRinnovoModal}
  title="Registra rinnovo quota"
  onClose={() => setShowRinnovoModal(false)}
>
  <form
  id="form-rinnovo-quota"
  onSubmit={(e) => {
    e.preventDefault();
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }}
>
    <div className="form-grid" style={{ marginTop: 12 }}>
      <input
        className="input"
        name="causale"
        value={`Quota associativa ${annoRinnovo}`}
        readOnly
      />

      <input
        className="input"
        name="anno_quota"
        type="number"
        min="2000"
        value={annoRinnovo}
        onChange={(e) => setAnnoRinnovo(Number(e.target.value || annoCorrente))}
        placeholder="Anno quota"
        required
      />

      <input
        className="input"
        name="importo"
        type="number"
        step="0.01"
        min="0"
        value={importoRinnovo}
        onChange={(e) => setImportoRinnovo(e.target.value)}
        placeholder="Importo"
        required
      />

      <select className="select" name="metodo" defaultValue="contanti" required>
        <option value="paypal">PayPal</option>
        <option value="bonifico">Bonifico</option>
        <option value="contanti">Contanti</option>
      </select>

      <input
        className="input"
        name="data_pagamento"
        type="date"
        value={dataPagamentoRinnovo}
        onChange={(e) => setDataPagamentoRinnovo(e.target.value)}
        required
      />

      <select
        className="select"
        name="tipo_pagatore"
        value={tipoPagatore}
        onChange={(e) =>
          setTipoPagatore(e.target.value as 'socio' | 'tutore' | 'altro')
        }
      >
        {!socio.e_minorenne && <option value="socio">Chi paga: socio</option>}
        {socio.e_minorenne && <option value="tutore">Chi paga: tutore legale</option>}
        <option value="altro">Chi paga: altra persona</option>
      </select>

      <input
        className="input"
        name="numero_transazione"
        placeholder="Numero transazione"
      />

      <input
        className="input"
        name="intestatario_transazione"
        placeholder="Intestatario ricevuta"
        required={tipoPagatore === 'altro'}
        value={tipoPagatore === 'altro' ? intestatarioAltro : intestatarioPagamento}
        readOnly={tipoPagatore !== 'altro'}
        onChange={(e) => {
          if (tipoPagatore === 'altro') {
            setIntestatarioAltro(e.target.value);
          }
        }}
      />

      <input
        className="input"
        name="indirizzo"
        placeholder="Indirizzo"
        required={tipoPagatore === 'altro'}
        value={tipoPagatore === 'altro' ? indirizzoAltro : indirizzoPagamento}
        readOnly={tipoPagatore !== 'altro'}
        onChange={(e) => {
          if (tipoPagatore === 'altro') {
            setIndirizzoAltro(e.target.value);
          }
        }}
      />

      <input
        className="input"
        name="codice_fiscale_pagatore"
        placeholder="Codice fiscale"
        required={tipoPagatore === 'altro'}
        value={tipoPagatore === 'altro' ? codiceFiscaleAltro : codiceFiscalePagamento}
        readOnly={tipoPagatore !== 'altro'}
        onChange={(e) => {
          if (tipoPagatore === 'altro') {
            setCodiceFiscaleAltro(toUpperCaseValue(e.target.value));
          }
        }}
      />

      <textarea
        className="textarea"
        name="nota"
        placeholder="Nota"
      />
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
      <button
  type="button"
  className="button"
  onClick={async () => {
    const form = document.getElementById('form-rinnovo-quota') as HTMLFormElement | null;

    if (!form) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    await handleRinnovoQuota(new FormData(form));
  }}
>
  Conferma
</button>
    </div>
  </form>
</Modal>
    </>
  );
}
