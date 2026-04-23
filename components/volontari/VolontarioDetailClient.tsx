'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import {
  attivaVolontarioAction,
  cessaVolontarioAction,
  ripristinaVolontarioAction,
  updateVolontarioAction,
} from '@/app/(gestionale)/volontari/actions';
import type { VolontarioDetail } from '@/lib/types';
import { DateSplitInput } from '@/components/form/DateSplitInput';
import { Modal } from '@/components/dashboard/Modal';
import { AppleWalletButton } from '@/components/wallet/AppleWalletButton';

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
  if (name === 'codice_fiscale' || name === 'tutore_codice_fiscale') return value.toUpperCase();
  if (name === 'email' || name === 'tutore_email') return value.toLowerCase();
  if (name === 'provincia' || name === 'provincia_nascita' || name === 'tutore_provincia') {
    return value.toUpperCase();
  }
  if (name.includes('data')) return value;
  if (name === 'cap' || name === 'tutore_cap') return value;
  if (name === 'telefono' || name === 'tutore_telefono') return value;
  return toTitleCase(value);
}

export function VolontarioDetailClient({ volontario }: { volontario: VolontarioDetail }) {
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

  const [statoNascita, setStatoNascita] = useState(
    (volontario as any).stato_nascita ||
      ((volontario as any).stato_estero_nascita ? 'estero' : 'italia')
  );

  const [tipologiaSelezionata, setTipologiaSelezionata] = useState<'continuativo' | 'occasionale'>(
    volontario.tipologia || 'occasionale'
  );

  const [statoOperativo, setStatoOperativo] = useState<'attivo' | 'sospeso'>(
    volontario.stato === 'attivo' ? 'attivo' : 'sospeso'
  );

  const [showConfermaContinuativoModal, setShowConfermaContinuativoModal] = useState(false);
  const [attivazioneInAttesa, setAttivazioneInAttesa] = useState(false);
  const [showCessazioneModal, setShowCessazioneModal] = useState(false);
  const [cessazioneInAttesa, setCessazioneInAttesa] = useState(false);
  const [showContinuativoArchiviatoModal, setShowContinuativoArchiviatoModal] = useState(false);

  const [showAttivaModal, setShowAttivaModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [showSalvaContinuativoModal, setShowSalvaContinuativoModal] = useState(false);

  const [showRipristinaModal, setShowRipristinaModal] = useState(false);
  const [ripristinoInAttesa, setRipristinoInAttesa] = useState(false);

  const campiBloccati =
    volontario.stato === 'attivo' && volontario.tipologia === 'continuativo';

  const isOccasionaleArchiviato =
    volontario.tipologia === 'occasionale' && volontario.data_cessazione !== null;

  async function handleUpdate(
    formData: FormData,
    options?: { suppressContinuativoSuccessUi?: boolean }
  ) {
    setFeedback({ error: null, success: null, loading: true });

    const statoNascitaForm = String(formData.get('stato_nascita') || '').toLowerCase();
    const comuneNascita = String(formData.get('comune_nascita') || '').trim();
    const provinciaNascita = String(formData.get('provincia_nascita') || '')
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 2);
    const statoEsteroNascita = String(formData.get('stato_estero_nascita') || '').trim();
    const cittaEsteraNascita = String(formData.get('citta_estera_nascita') || '').trim();

    const tipologiaDaSalvare = String(
      formData.get('tipologia') || tipologiaSelezionata || 'occasionale'
    ) as 'continuativo' | 'occasionale';

    const attivaComeOccasionale =
      volontario.stato !== 'attivo' && tipologiaDaSalvare === 'occasionale';

    const result = await updateVolontarioAction({
      volontarioId: volontario.id,
      nome: String(formData.get('nome') || ''),
      cognome: String(formData.get('cognome') || ''),
      data_nascita: String(formData.get('data_nascita') || ''),
      stato_nascita: statoNascitaForm,
      luogo_nascita:
        statoNascitaForm === 'estero' ? cittaEsteraNascita : comuneNascita,
      provincia_nascita: statoNascitaForm === 'estero' ? '' : provinciaNascita,
      stato_estero_nascita:
        statoNascitaForm === 'estero' ? statoEsteroNascita : '',
      codice_fiscale: String(formData.get('codice_fiscale') || ''),
      indirizzo: String(formData.get('indirizzo') || ''),
      cap: String(formData.get('cap') || ''),
      comune: String(formData.get('comune') || ''),
      provincia: String(formData.get('provincia') || '')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 2),
      telefono: String(formData.get('telefono') || ''),
      email: String(formData.get('email') || ''),
      stato: attivaComeOccasionale ? 'attivo' : String(volontario.stato),
      tipologia: tipologiaDaSalvare,
      tutore_nome: String(formData.get('tutore_nome') || ''),
      tutore_cognome: String(formData.get('tutore_cognome') || ''),
      tutore_codice_fiscale: String(formData.get('tutore_codice_fiscale') || ''),
      tutore_telefono: String(formData.get('tutore_telefono') || ''),
      tutore_email: String(formData.get('tutore_email') || ''),
      tutore_parentela: String(formData.get('tutore_parentela') || ''),
      tutore_indirizzo: String(formData.get('tutore_indirizzo') || ''),
      tutore_cap: String(formData.get('tutore_cap') || ''),
      tutore_comune: String(formData.get('tutore_comune') || ''),
      tutore_provincia: String(formData.get('tutore_provincia') || '')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 2),
    });

    if (!result.ok) {
      setFeedback({ error: result.error, success: null, loading: false });
      return false;
    }

    setFeedback({ error: null, success: null, loading: false });

    if (tipologiaDaSalvare === 'occasionale') {
      router.push('/volontari');
      return true;
    }

    if (options?.suppressContinuativoSuccessUi) {
      return true;
    }

    setShowSavedIcon(true);

    setTimeout(() => {
      setShowSavedIcon(false);
      router.refresh();
    }, 1000);

    return true;
  }

  async function handleSalvaEAttivaVolontario() {
    if (!pendingFormData) return;
    const data = pendingFormData;
    setPendingFormData(null);
    await handleUpdate(data);
  }

  async function handleAttivazione() {
  const continuativoArchiviato =
    volontario.tipologia === 'continuativo' && volontario.data_cessazione !== null;

  if (continuativoArchiviato) {
    setShowContinuativoArchiviatoModal(true);
    return;
  }

  if (statoOperativo === 'attivo' && tipologiaSelezionata === 'continuativo') {
    return;
  }

  if (tipologiaSelezionata === 'continuativo') {
    setShowConfermaContinuativoModal(true);
    return;
  }

  if (tipologiaSelezionata === 'occasionale' && volontario.stato !== 'attivo') {
    setShowRipristinaModal(true);
    return;
  }

  setFeedback({ error: null, success: null, loading: true });

  const result = await attivaVolontarioAction({
    volontarioId: volontario.id,
    tipologia: tipologiaSelezionata,
  });

  if (!result.ok) {
    setFeedback({ error: result.error, success: null, loading: false });
    return;
  }

  setStatoOperativo('attivo');
  setFeedback({ error: null, success: null, loading: false });
  setShowSavedIcon(true);

  setTimeout(() => {
    setShowSavedIcon(false);
    router.push('/volontari');
  }, 900);
}

  async function handleConfermaContinuativo() {
    setAttivazioneInAttesa(true);
    setFeedback({ error: null, success: null, loading: true });

    const result = await attivaVolontarioAction({
      volontarioId: volontario.id,
      tipologia: 'continuativo',
    });

    if (!result.ok) {
      setAttivazioneInAttesa(false);
      setShowConfermaContinuativoModal(false);
      setFeedback({ error: result.error, success: null, loading: false });
      return;
    }

    setStatoOperativo('attivo');
    setShowConfermaContinuativoModal(false);
    setAttivazioneInAttesa(false);
    setFeedback({ error: null, success: null, loading: false });
    router.push('/volontari');
  }

  async function handleRipristino() {
    setRipristinoInAttesa(true);
    setFeedback({ error: null, success: null, loading: true });

    const result = await ripristinaVolontarioAction({
      volontarioId: volontario.id,
    });

    if (!result.ok) {
      setRipristinoInAttesa(false);
      setFeedback({ error: result.error, success: null, loading: false });
      return;
    }

    setShowRipristinaModal(false);
    setRipristinoInAttesa(false);
    setFeedback({ error: null, success: null, loading: false });
    router.push('/volontari');
  }

  async function handleCessazione(formData: FormData) {
    setCessazioneInAttesa(true);
    setFeedback({ error: null, success: null, loading: true });

    const result = await cessaVolontarioAction({
      volontarioId: volontario.id,
      data_cessazione: String(formData.get('data_cessazione') || ''),
      note: String(formData.get('note') || ''),
    });

    if (!result.ok) {
      setCessazioneInAttesa(false);
      setShowCessazioneModal(false);
      setFeedback({ error: result.error, success: null, loading: false });
      return;
    }

    setShowCessazioneModal(false);
    setCessazioneInAttesa(false);
    router.push('/volontari');
  }

  return (
    <>
      <PageHeader
        title={`${volontario.nome} ${volontario.cognome}`}
        subtitle={`Codice volontario: ${volontario.codice_univoco}`}
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {isOccasionaleArchiviato && (
              <button
                type="button"
                className="button secondary"
                onClick={() => setShowRipristinaModal(true)}
              >
                Ripristina
              </button>
            )}

            <button
              type="button"
              className="detail-close-button"
              onClick={() => router.push('/volontari')}
              aria-label="Chiudi scheda volontario"
              title="Chiudi"
            >
              ×
            </button>
          </div>
        }
      />

      <div className="grid-2">
        <div className="card">
          <div className="form-section-title">Intestazione scheda</div>

          <div className="detail-summary-row">
            <span className="detail-summary-label">Nome e cognome:</span>
            <span className="detail-summary-value">{volontario.nome} {volontario.cognome}</span>
          </div>

          <div className="detail-summary-row">
            <span className="detail-summary-label">Codice univoco:</span>
            <span className="detail-summary-value">{volontario.codice_univoco}</span>
          </div>

          <div className="detail-summary-row">
            <span className="detail-summary-label">Data inizio:</span>
            <span className="detail-summary-value">{volontario.data_inizio}</span>
          </div>

          <div className="detail-summary-row">
            <span className="detail-summary-label">Tipologia:</span>
            <span className="detail-summary-value detail-summary-value--caps">
              {volontario.tipologia}
            </span>
          </div>

          <AppleWalletButton type="volunteer" id={volontario.id} />

          <div className="detail-summary-row detail-summary-row--status">
            <span className="detail-summary-label">Conferma attivazione:</span>
          </div>

          <button
            type="button"
            className={`status-switch ${statoOperativo === 'attivo' ? 'is-active' : 'is-suspended'}`}
            onClick={handleAttivazione}
            disabled={feedback.loading || attivazioneInAttesa || ripristinoInAttesa}
          >
            <div className="status-switch-track">
              <div className="status-switch-text">
                {statoOperativo === 'attivo' ? 'ON' : 'OFF'}
              </div>
              <div className="status-switch-knob" />
            </div>
          </button>
        </div>

        <div className="card">
          <div className="form-section-title">Flag principali</div>

          <div className="detail-summary-row">
            <span className="detail-summary-label">Deriva da socio:</span>
            <span className="detail-summary-value">{volontario.socio_id ? 'Sì' : 'No'}</span>
          </div>

          <div className="detail-summary-row">
            <span className="detail-summary-label">Minorenne:</span>
            <span className="detail-summary-value">{volontario.minorenne ? 'Sì' : 'No'}</span>
          </div>

          <div className="detail-summary-row">
            <span className="detail-summary-label">Modifica bloccata:</span>
            <span className="detail-summary-value">{volontario.modifica_bloccata ? 'Sì' : 'No'}</span>
          </div>

          <div className="detail-summary-row">
            <span className="detail-summary-label">Data cessazione:</span>
            <span className="detail-summary-value">{volontario.data_cessazione ?? '—'}</span>
          </div>

          {(volontario.stato === 'sospeso' ||
            (volontario.stato === 'attivo' && volontario.tipologia === 'occasionale')) && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                Selezione tipo
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="radio"
                    name="tipologia_attivazione"
                    value="continuativo"
                    checked={tipologiaSelezionata === 'continuativo'}
                    onChange={() => {
                      setTipologiaSelezionata('continuativo');
                      setStatoOperativo('sospeso');
                    }}
                  />
                  <span>Continuativo</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="radio"
                    name="tipologia_attivazione"
                    value="occasionale"
                    checked={tipologiaSelezionata === 'occasionale'}
                    onChange={() => {
                      setTipologiaSelezionata('occasionale');
                      setStatoOperativo('attivo');
                    }}
                  />
                  <span>Occasionale</span>
                </label>
              </div>

              {tipologiaSelezionata === 'continuativo' && (
                <p style={{ marginTop: 12, marginBottom: 0 }} className="muted">
                  Passa a ON per confermare.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="form-section-title">Dati volontario</div>

        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
          }}
          onInput={(e) => {
            const target = e.target as HTMLInputElement | HTMLSelectElement;
            if (!target.name) return;
            if (target.tagName === 'SELECT') return;
            target.value = normalizeInputValue(target.name, target.value);
          }}
          onKeyDown={(e) => {
            const target = e.target as HTMLElement;
            if (e.key === 'Enter' && target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="tipologia" value={tipologiaSelezionata} />

          <div className="form-grid">
            <input className="input" name="nome" defaultValue={volontario.nome} placeholder="Nome" required disabled={campiBloccati} />
            <input className="input" name="cognome" defaultValue={volontario.cognome} placeholder="Cognome" required disabled={campiBloccati} />
            <DateSplitInput name="data_nascita" value={volontario.data_nascita ?? ''} />

            <select
              className="input"
              name="stato_nascita"
              value={statoNascita}
              onChange={(e) => setStatoNascita(e.currentTarget.value)}
              disabled={campiBloccati}
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
                  defaultValue={volontario.luogo_nascita ?? ''}
                  placeholder="Comune di nascita"
                  disabled={campiBloccati}
                  required
                />
                <input
                  className="input"
                  name="provincia_nascita"
                  defaultValue={volontario.provincia_nascita ?? ''}
                  placeholder="Provincia di nascita"
                  disabled={campiBloccati}
                  maxLength={2}
                  required
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
                  defaultValue={(volontario as any).stato_estero_nascita ?? ''}
                  placeholder="Stato di nascita"
                  disabled={campiBloccati}
                  required
                />
                <input
                  className="input"
                  name="citta_estera_nascita"
                  defaultValue={volontario.luogo_nascita ?? ''}
                  placeholder="Città di nascita"
                  disabled={campiBloccati}
                  required
                />
              </>
            )}

            <input className="input" name="codice_fiscale" defaultValue={volontario.codice_fiscale ?? ''} placeholder="Codice fiscale" disabled={campiBloccati} />
            <input className="input" name="indirizzo" defaultValue={volontario.indirizzo ?? ''} placeholder="Via / indirizzo" disabled={campiBloccati} />
            <input className="input" name="cap" defaultValue={volontario.cap ?? ''} placeholder="CAP" disabled={campiBloccati} />
            <input className="input" name="comune" defaultValue={volontario.comune ?? ''} placeholder="Comune" disabled={campiBloccati} />
            <input
              className="input"
              name="provincia"
              defaultValue={volontario.provincia ?? ''}
              placeholder="Provincia"
              disabled={campiBloccati}
              maxLength={2}
              onBlur={(e) => {
                e.currentTarget.value = e.currentTarget.value
                  .replace(/[^a-zA-Z]/g, '')
                  .toUpperCase()
                  .slice(0, 2);
              }}
            />
            <input className="input" name="telefono" defaultValue={volontario.telefono ?? ''} placeholder="Telefono" disabled={campiBloccati} />
            <input className="input" name="email" defaultValue={volontario.email ?? ''} placeholder="Email" disabled={campiBloccati} />

            {volontario.minorenne && (
              <>
                <div className="form-section-title">Dati tutore</div>

                <input className="input" name="tutore_nome" defaultValue={volontario.tutore_nome ?? ''} placeholder="Nome tutore" disabled={campiBloccati} />
                <input className="input" name="tutore_cognome" defaultValue={volontario.tutore_cognome ?? ''} placeholder="Cognome tutore" disabled={campiBloccati} />
                <input className="input" name="tutore_codice_fiscale" defaultValue={volontario.tutore_codice_fiscale ?? ''} placeholder="Codice fiscale tutore" disabled={campiBloccati} />
                <input className="input" name="tutore_telefono" defaultValue={volontario.tutore_telefono ?? ''} placeholder="Telefono tutore" disabled={campiBloccati} />
                <input className="input" name="tutore_email" defaultValue={volontario.tutore_email ?? ''} placeholder="Email tutore" disabled={campiBloccati} />
                <input className="input" name="tutore_parentela" defaultValue={volontario.tutore_parentela ?? ''} placeholder="Parentela / ruolo" disabled={campiBloccati} />
                <input className="input" name="tutore_indirizzo" defaultValue={volontario.tutore_indirizzo ?? ''} placeholder="Indirizzo tutore" disabled={campiBloccati} />
                <input className="input" name="tutore_cap" defaultValue={volontario.tutore_cap ?? ''} placeholder="CAP tutore" disabled={campiBloccati} />
                <input className="input" name="tutore_comune" defaultValue={volontario.tutore_comune ?? ''} placeholder="Comune tutore" disabled={campiBloccati} />
                <input
                  className="input"
                  name="tutore_provincia"
                  defaultValue={volontario.tutore_provincia ?? ''}
                  placeholder="Provincia tutore"
                  disabled={campiBloccati}
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
          </div>

          <div className="save-action-row">
            <button
              className="button"
              type="button"
              disabled={volontario.modifica_bloccata || campiBloccati || feedback.loading}
              onClick={() => {
                if (!formRef.current) return;

                const formData = new FormData(formRef.current);

                const tipologiaDaSalvare = String(
                  formData.get('tipologia') || tipologiaSelezionata || 'occasionale'
                ) as 'continuativo' | 'occasionale';

                const vaInOccasionaliAttivi =
                  volontario.stato !== 'attivo' && tipologiaDaSalvare === 'occasionale';

                const vaDaOccasionaleAContinuativo =
                  volontario.tipologia === 'occasionale' &&
                  tipologiaDaSalvare === 'continuativo';

                if (vaInOccasionaliAttivi) {
                  setPendingFormData(formData);
                  setShowAttivaModal(true);
                  return;
                }

                if (vaDaOccasionaleAContinuativo) {
                  setPendingFormData(formData);
                  setShowSalvaContinuativoModal(true);
                  return;
                }

                void handleUpdate(formData);
              }}
            >
              Salva
            </button>

            {showSavedIcon && (
              <span className="save-success-icon" aria-label="Salvataggio completato" title="Salvato">
                ✓
              </span>
            )}
          </div>
        </form>
      </div>

      <Modal
        open={showAttivaModal}
        title="Attivare il nuovo volontario?"
        onClose={() => {
          setShowAttivaModal(false);
          setPendingFormData(null);
        }}
      >
        <p style={{ marginTop: 0 }}>
          Sei sicura di voler attivare il nuovo volontario? Confermando, verranno
          salvati i dati e il volontario sarà inserito tra gli Occasionali attivi.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            className="button"
            onClick={async () => {
              setShowAttivaModal(false);
              await handleSalvaEAttivaVolontario();
            }}
          >
            Conferma
          </button>
        </div>
      </Modal>

      <Modal
        open={showSalvaContinuativoModal}
        title="Salvare il volontario come continuativo?"
        onClose={() => {
          if (!attivazioneInAttesa) {
            setShowSalvaContinuativoModal(false);
            setPendingFormData(null);
          }
        }}
      >
        <p style={{ marginTop: 0 }}>
          Stai per salvare il volontario come continuativo. Una volta confermato non
          sarà più possibile effettuare modifiche.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
          <button
            type="button"
            className="button"
            onClick={async () => {
              if (!pendingFormData) return;

              setAttivazioneInAttesa(true);

              const data = pendingFormData;

              const updateOk = await handleUpdate(data, {
                suppressContinuativoSuccessUi: true,
              });

              if (!updateOk) {
                setAttivazioneInAttesa(false);
                return;
              }

              const result = await attivaVolontarioAction({
                volontarioId: volontario.id,
                tipologia: 'continuativo',
              });

              if (!result.ok) {
                setAttivazioneInAttesa(false);
                setFeedback({ error: result.error, success: null, loading: false });
                return;
              }

              setPendingFormData(null);
              setShowSalvaContinuativoModal(false);
              setAttivazioneInAttesa(false);
              setStatoOperativo('attivo');
              setFeedback({ error: null, success: null, loading: false });

              router.push('/volontari');
            }}
            disabled={attivazioneInAttesa}
          >
            {attivazioneInAttesa ? 'Salvataggio...' : 'Conferma'}
          </button>
        </div>
      </Modal>

           <div className="card" style={{ marginTop: 24 }}>
        <div className="form-section-title">Cessazione attività</div>

        {volontario.tipologia === 'continuativo' && volontario.data_cessazione ? (
          <div className="form-grid">
            <input
              className="input"
              value={volontario.data_cessazione}
              disabled
              readOnly
            />
            <textarea
              className="textarea"
              value={volontario.nota_cessazione ?? ''}
              placeholder="Nessuna nota salvata"
              disabled
              readOnly
            />
          </div>
        ) : (
          <form id="form-cessazione-volontario" action={handleCessazione}>
            <div className="form-grid">
              <DateSplitInput name="data_cessazione" required />
              <textarea className="textarea" name="note" placeholder="Note cessazione" />
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                className="button"
                type="button"
                onClick={() => setShowCessazioneModal(true)}
              >
                Conferma
              </button>
            </div>
          </form>
        )}
      </div>

      <Modal
        open={showConfermaContinuativoModal}
        title="Confermare volontario continuativo?"
        onClose={() => {
          if (!attivazioneInAttesa) {
            setShowConfermaContinuativoModal(false);
          }
        }}
      >
        <p style={{ marginTop: 0 }}>
          Sei sicura di voler confermare questo volontario come continuativo?
          Una volta attivato, i dati non saranno più modificabili.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
          <button
            type="button"
            className="button"
            onClick={handleConfermaContinuativo}
            disabled={attivazioneInAttesa}
          >
            {attivazioneInAttesa ? 'Salvataggio...' : 'Conferma'}
          </button>
        </div>
      </Modal>

      <Modal
        open={showRipristinaModal}
        title="Ripristinare il volontario?"
        onClose={() => {
          if (!ripristinoInAttesa) {
            setShowRipristinaModal(false);
          }
        }}
      >
        <p style={{ marginTop: 0 }}>
          Sei sicura di voler ripristinare il volontario?
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
          <button
            type="button"
            className="button"
            onClick={handleRipristino}
            disabled={ripristinoInAttesa}
          >
            {ripristinoInAttesa ? 'Salvataggio...' : 'Conferma'}
          </button>
        </div>
      </Modal>

      <Modal
        open={showContinuativoArchiviatoModal}
        title="Ripristino non disponibile"
        onClose={() => setShowContinuativoArchiviatoModal(false)}
      >
        <p style={{ marginTop: 0 }}>
          Impossibile ripristinare un volontario continuativo archiviato.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
          <button
            type="button"
            className="button"
            onClick={() => setShowContinuativoArchiviatoModal(false)}
          >
            Chiudi
          </button>
        </div>
      </Modal>

            <Modal
        open={showCessazioneModal}
        title="Chiudere la posizione del volontario?"
        onClose={() => {
          if (!cessazioneInAttesa) {
            setShowCessazioneModal(false);
          }
        }}
      >
        <p style={{ marginTop: 0 }}>
          {volontario.tipologia === 'continuativo'
            ? 'Sei sicura di voler chiudere la posizione del volontario? Una volta chiusa la scheda, non potrà più essere ripristinata.'
            : 'Sei sicura di voler chiudere la posizione del volontario? Il volontario sarà spostato in archivio e potrà essere ripristinato in seguito.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
          <button
            type="button"
            className="button"
            onClick={() => {
              const form = document.getElementById('form-cessazione-volontario') as HTMLFormElement | null;
              if (form) {
                form.requestSubmit();
              }
            }}
            disabled={cessazioneInAttesa}
          >
            {cessazioneInAttesa ? 'Salvataggio...' : 'Conferma'}
          </button>
        </div>
      </Modal>
    </>
  );
}
