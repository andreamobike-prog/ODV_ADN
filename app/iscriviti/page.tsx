'use client';

import Link from 'next/link';
import { submitIscrizioneAction } from './actions';
import { useMemo, useState, useTransition, type CSSProperties } from 'react';
import { Printer, Forward, Copy } from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeProvince(value: string) {
  return value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
}

function normalizeCodiceFiscale(value: string) {
  return value.replace(/\s+/g, '').toUpperCase().slice(0, 16);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeNumeric(value: string) {
  return value.replace(/\D+/g, '');
}

function isValidCodiceFiscale(cf: string) {
  const value = cf.trim().toUpperCase();

  if (!/^[A-Z0-9]{16}$/.test(value)) return false;

  const oddMap: Record<string, number> = {
    '0': 1,
    '1': 0,
    '2': 5,
    '3': 7,
    '4': 9,
    '5': 13,
    '6': 15,
    '7': 17,
    '8': 19,
    '9': 21,
    A: 1,
    B: 0,
    C: 5,
    D: 7,
    E: 9,
    F: 13,
    G: 15,
    H: 17,
    I: 19,
    J: 21,
    K: 2,
    L: 4,
    M: 18,
    N: 20,
    O: 11,
    P: 3,
    Q: 6,
    R: 8,
    S: 12,
    T: 14,
    U: 16,
    V: 10,
    W: 22,
    X: 25,
    Y: 24,
    Z: 23,
  };

  const evenMap: Record<string, number> = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25,
  };

  let sum = 0;

  for (let i = 0; i < 15; i++) {
    const char = value[i];
    sum += i % 2 === 0 ? oddMap[char] : evenMap[char];
  }

  const expectedControlChar = String.fromCharCode((sum % 26) + 65);

  return value[15] === expectedControlChar;
}

function isValidPartitaIva(value: string) {
  const iva = value.replace(/\D+/g, '');

  if (!/^\d{11}$/.test(iva)) return false;

  let sum = 0;

  for (let i = 0; i < 10; i++) {
    let n = Number(iva[i]);

    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    sum += n;
  }

  const check = (10 - (sum % 10)) % 10;

  return check === Number(iva[10]);
}

function isValidCfOrPartitaIva(value: string) {
  const cleaned = value.trim().toUpperCase();

  if (/^[A-Z0-9]{16}$/.test(cleaned)) {
    return isValidCodiceFiscale(cleaned);
  }

  if (/^\d{11}$/.test(cleaned)) {
    return isValidPartitaIva(cleaned);
  }

  return false;
}

export default function IscrivitiPage() {
  const [minorenne, setMinorenne] = useState('');
  const [chiPaga, setChiPaga] = useState('');
  const [nascitaSocio, setNascitaSocio] = useState('');
  const [nascitaTutore, setNascitaTutore] = useState('');
  const [erroreCfSocio, setErroreCfSocio] = useState('');
  const [erroreCfTutore, setErroreCfTutore] = useState('');
  const [erroreCfPagatore, setErroreCfPagatore] = useState('');
  const [step, setStep] = useState(1);
const [riepilogo, setRiepilogo] = useState<Record<string, string>>({});
const [metodoPagamento, setMetodoPagamento] = useState('');
const [showBonificoModal, setShowBonificoModal] = useState(false);
const [bonificoCopied, setBonificoCopied] = useState(false);
const [showBonificoCopiedModal, setShowBonificoCopiedModal] = useState(false);
const [showBonificoEsitoModal, setShowBonificoEsitoModal] = useState(false);
const [isPending, startTransition] = useTransition();
const [submitError, setSubmitError] = useState('');
const [submitSuccess, setSubmitSuccess] = useState('');
const [paypalProcessing, setPaypalProcessing] = useState(false);
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  const opzioniPagamento = useMemo(() => {
    if (minorenne === 'si') {
      return [
        { value: 'tutore', label: 'Tutore' },
        { value: 'altro', label: 'Altro' },
      ];
    }

    if (minorenne === 'no') {
      return [
        { value: 'socio', label: 'Socio' },
        { value: 'altro', label: 'Altro' },
      ];
    }

    return [];
  }, [minorenne]);

  function handleContinua(e: any) {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;

    const socioCfInput = form.elements.namedItem(
      'codiceFiscale'
    ) as HTMLInputElement | null;

    const tutoreCfInput = form.elements.namedItem(
      'tutoreCodiceFiscale'
    ) as HTMLInputElement | null;

    const pagatoreCfPivaInput = form.elements.namedItem(
      'pagatoreCfPiva'
    ) as HTMLInputElement | null;

    const socioCf = normalizeCodiceFiscale(socioCfInput?.value || '');
    const tutoreCf = normalizeCodiceFiscale(tutoreCfInput?.value || '');
    const pagatoreCfPiva = (pagatoreCfPivaInput?.value || '').trim().toUpperCase();

    let hasError = false;

    if (!form.reportValidity()) return;

    if (!isValidCodiceFiscale(socioCf)) {
      setErroreCfSocio('Codice fiscale del socio non valido.');
      hasError = true;
    } else {
      setErroreCfSocio('');
    }

    if (minorenne === 'si') {
      if (!isValidCodiceFiscale(tutoreCf)) {
        setErroreCfTutore('Codice fiscale del tutore non valido.');
        hasError = true;
      } else {
        setErroreCfTutore('');
      }
    } else {
      setErroreCfTutore('');
    }

    if (chiPaga === 'altro') {
      if (!pagatoreCfPiva || !isValidCfOrPartitaIva(pagatoreCfPiva)) {
        setErroreCfPagatore(
          'Inserisci un codice fiscale valido oppure una partita IVA valida.'
        );
        hasError = true;
      } else {
        setErroreCfPagatore('');
      }
    } else {
      setErroreCfPagatore('');
    }

    if (hasError) return;

    setSubmitError('');
    setSubmitSuccess('');

    setRiepilogo({
      nome: ((form.elements.namedItem('nome') as HTMLInputElement | null)?.value || '').trim(),
      cognome: ((form.elements.namedItem('cognome') as HTMLInputElement | null)?.value || '').trim(),
      dataNascita: ((form.elements.namedItem('dataNascita') as HTMLInputElement | null)?.value || '').trim(),
      codiceFiscale: socioCf,
      email: ((form.elements.namedItem('email') as HTMLInputElement | null)?.value || '').trim(),
      telefono: ((form.elements.namedItem('telefono') as HTMLInputElement | null)?.value || '').trim(),
      indirizzo: ((form.elements.namedItem('indirizzo') as HTMLInputElement | null)?.value || '').trim(),
      cap: ((form.elements.namedItem('cap') as HTMLInputElement | null)?.value || '').trim(),
      comune: ((form.elements.namedItem('comune') as HTMLInputElement | null)?.value || '').trim(),
      provincia: ((form.elements.namedItem('provincia') as HTMLInputElement | null)?.value || '').trim(),
      minorenne,
      chiPaga,
      tutoreNome: ((form.elements.namedItem('tutoreNome') as HTMLInputElement | null)?.value || '').trim(),
      tutoreCognome: ((form.elements.namedItem('tutoreCognome') as HTMLInputElement | null)?.value || '').trim(),
      tutoreDataNascita: ((form.elements.namedItem('tutoreDataNascita') as HTMLInputElement | null)?.value || '').trim(),
      tutoreCodiceFiscale: tutoreCf,
      tutoreEmail: ((form.elements.namedItem('tutoreEmail') as HTMLInputElement | null)?.value || '').trim(),
      tutoreTelefono: ((form.elements.namedItem('tutoreTelefono') as HTMLInputElement | null)?.value || '').trim(),
      pagatoreNome: ((form.elements.namedItem('pagatoreNome') as HTMLInputElement | null)?.value || '').trim(),
      pagatoreCognome: ((form.elements.namedItem('pagatoreCognome') as HTMLInputElement | null)?.value || '').trim(),
      pagatoreCfPiva,
    });

    setStep(2);
  }

  function handleConfermaIscrizione(paypalTransactionId?: string) {
    if (!metodoPagamento) {
      setSubmitError('Seleziona un metodo di pagamento.');
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');

    const socioLuogoNascita =
      nascitaSocio === 'estero'
        ? ''
        : ((document.getElementById('luogoNascita') as HTMLInputElement | null)?.value || '').trim();

    const socioProvinciaNascita =
      nascitaSocio === 'estero'
        ? 'EE'
        : ((document.getElementById('provinciaNascita') as HTMLInputElement | null)?.value || '')
            .trim()
            .toUpperCase();

    const socioStatoNascitaEstero =
      nascitaSocio === 'estero'
        ? ((document.getElementById('statoNascitaEstero') as HTMLInputElement | null)?.value || '').trim()
        : '';

    const socioCittaNascitaEstero =
      nascitaSocio === 'estero'
        ? ((document.getElementById('cittaNascitaEstero') as HTMLInputElement | null)?.value || '').trim()
        : '';

    const tutoreLuogoNascita =
      nascitaTutore === 'estero'
        ? ''
        : ((document.getElementById('tutoreLuogoNascita') as HTMLInputElement | null)?.value || '').trim();

    const tutoreProvinciaNascita =
      nascitaTutore === 'estero'
        ? 'EE'
        : ((document.getElementById('tutoreProvinciaNascita') as HTMLInputElement | null)?.value || '')
            .trim()
            .toUpperCase();

    const tutoreStatoNascitaEstero =
      nascitaTutore === 'estero'
        ? ((document.getElementById('tutoreStatoNascitaEstero') as HTMLInputElement | null)?.value || '').trim()
        : '';

    const tutoreCittaNascitaEstero =
      nascitaTutore === 'estero'
        ? ((document.getElementById('tutoreCittaNascitaEstero') as HTMLInputElement | null)?.value || '').trim()
        : '';

    startTransition(async () => {
      const result = await submitIscrizioneAction({
        nome: riepilogo.nome || '',
        cognome: riepilogo.cognome || '',
        dataNascita: riepilogo.dataNascita || '',
        nascitaSocio: (nascitaSocio || '') as 'italia' | 'estero' | '',
        luogoNascita: socioLuogoNascita,
        provinciaNascita: socioProvinciaNascita,
        statoNascitaEstero: socioStatoNascitaEstero,
        cittaNascitaEstero: socioCittaNascitaEstero,
        codiceFiscale: riepilogo.codiceFiscale || '',
        email: riepilogo.email || '',
        telefono: riepilogo.telefono || '',
        indirizzo: riepilogo.indirizzo || '',
        cap: riepilogo.cap || '',
        comune: riepilogo.comune || '',
        provincia: riepilogo.provincia || '',
        minorenne: (riepilogo.minorenne || 'no') as 'si' | 'no',
        chiPaga: (riepilogo.chiPaga || '') as 'socio' | 'tutore' | 'altro' | '',
        metodoPagamento: metodoPagamento as 'paypal' | 'bonifico',
        tutoreNome: riepilogo.tutoreNome || '',
        tutoreCognome: riepilogo.tutoreCognome || '',
        tutoreDataNascita: riepilogo.tutoreDataNascita || '',
        nascitaTutore: (nascitaTutore || '') as 'italia' | 'estero' | '',
        tutoreLuogoNascita,
        tutoreProvinciaNascita,
        tutoreStatoNascitaEstero,
        tutoreCittaNascitaEstero,
        tutoreCodiceFiscale: riepilogo.tutoreCodiceFiscale || '',
        tutoreEmail: riepilogo.tutoreEmail || '',
        tutoreTelefono: riepilogo.tutoreTelefono || '',
        tutoreIndirizzo:
          ((document.getElementById('tutoreIndirizzo') as HTMLInputElement | null)?.value || '').trim(),
        tutoreCap:
          ((document.getElementById('tutoreCap') as HTMLInputElement | null)?.value || '').trim(),
        tutoreComune:
          ((document.getElementById('tutoreComune') as HTMLInputElement | null)?.value || '').trim(),
        tutoreProvincia:
          ((document.getElementById('tutoreProvincia') as HTMLInputElement | null)?.value || '')
            .trim()
            .toUpperCase(),
        pagatoreNome: riepilogo.pagatoreNome || '',
        pagatoreCognome: riepilogo.pagatoreCognome || '',
        pagatoreIndirizzo:
          ((document.getElementById('pagatoreIndirizzo') as HTMLInputElement | null)?.value || '').trim(),
        pagatoreCap:
          ((document.getElementById('pagatoreCap') as HTMLInputElement | null)?.value || '').trim(),
        pagatoreComune:
          ((document.getElementById('pagatoreComune') as HTMLInputElement | null)?.value || '').trim(),
        pagatoreProvincia:
          ((document.getElementById('pagatoreProvincia') as HTMLInputElement | null)?.value || '')
            .trim()
            .toUpperCase(),
        pagatoreCfPiva: riepilogo.pagatoreCfPiva || '',
        paypalTransactionId: paypalTransactionId || '',
      });

      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }

      if (metodoPagamento === 'bonifico') {
  setSubmitSuccess('');
  setShowBonificoEsitoModal(true);
  return;
}

      setSubmitSuccess(
        'Pagamento completato e iscrizione confermata correttamente.'
      );
      setStep(5);
    });
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: 'EUR',
        intent: 'capture',
      }}
    >
      <main
        style={{
          minHeight: '100vh',
          background: '#f7f7f5',
          padding: '48px 20px',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: '#1f2937',
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: '0 auto',
          }}
        >
          <section
            style={{
              position: 'relative',
              background: '#ffffff',
              borderRadius: 0,
              padding: '32px 28px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              marginBottom: 24,
            }}
          >
            <Link
              href="/"
              aria-label="Chiudi"
              className="button secondary"
              style={closeButtonStyle}
            >
              ✕
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 24,
                flexWrap: 'wrap',
                paddingRight: 56,
              }}
            >
              <img
                src="/logo.png"
                alt="Logo Angeli dei Navigli"
                style={{
                  width: 96,
                  height: 96,
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: 28,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    color: '#111827',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ANGELI DEI NAVIGLI ODV ETS
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 18,
                    lineHeight: 1.3,
                    color: '#667085',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Organizzazione di Volontariato
                </div>
              </div>
            </div>

            <div style={{ maxWidth: 780 }}>
              <h1
                style={{
                  margin: '0 0 16px 0',
                  fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                  lineHeight: 1.1,
                  fontWeight: 800,
                  color: '#111827',
                }}
              >
                Iscriviti all’associazione
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: '#374151',
                }}
              >
                Compila il form per avviare la richiesta di iscrizione.
                Tutti i campi visibili sono obbligatori.
              </p>
            </div>
          </section>

          <section
            style={{
              display: step === 1 ? 'block' : 'none',
              background: '#ffffff',
              borderRadius: 0,
              padding: '32px 28px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            }}
          >
            <form
              onSubmit={handleContinua}
              style={{
                display: 'grid',
                gap: 28,
              }}
            >
              <section>
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: 24,
                    fontSize: 28,
                    color: '#111827',
                  }}
                >
                  Dati del socio
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 20,
                    }}
                  >
                    <div>
                      <label htmlFor="nome" style={labelStyle}>
                        Nome
                      </label>
                      <input
                        id="nome"
                        name="nome"
                        type="text"
                        required
                        style={inputStyle}
                        onBlur={(e) => {
                          e.currentTarget.value = toTitleCase(e.currentTarget.value);
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="cognome" style={labelStyle}>
                        Cognome
                      </label>
                      <input
                        id="cognome"
                        name="cognome"
                        type="text"
                        required
                        style={inputStyle}
                        onBlur={(e) => {
                          e.currentTarget.value = toTitleCase(e.currentTarget.value);
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 20,
                    }}
                  >
                    <div>
  <label htmlFor="dataNascitaGiorno" style={labelStyle}>
    Data di nascita
  </label>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '92px 92px minmax(120px, 1fr)',
      gap: 12,
    }}
  >
    <input
      id="dataNascitaGiorno"
      name="dataNascitaGiorno"
      type="text"
      inputMode="numeric"
      placeholder="GG"
      maxLength={2}
      required
      style={inputStyle}
      onChange={(e) => {
        e.currentTarget.value = normalizeNumeric(e.currentTarget.value).slice(0, 2);
      }}
      onInput={(e) => {
        const target = e.currentTarget;
        if (target.value.length === 2) {
          const meseInput = document.getElementById(
            'dataNascitaMese'
          ) as HTMLInputElement | null;
          meseInput?.focus();
        }
      }}
    />

    <input
      id="dataNascitaMese"
      name="dataNascitaMese"
      type="text"
      inputMode="numeric"
      placeholder="MM"
      maxLength={2}
      required
      style={inputStyle}
      onChange={(e) => {
        e.currentTarget.value = normalizeNumeric(e.currentTarget.value).slice(0, 2);
      }}
      onInput={(e) => {
        const target = e.currentTarget;
        if (target.value.length === 2) {
          const annoInput = document.getElementById(
            'dataNascitaAnno'
          ) as HTMLInputElement | null;
          annoInput?.focus();
        }
      }}
    />

    <input
      id="dataNascitaAnno"
      name="dataNascitaAnno"
      type="text"
      inputMode="numeric"
      placeholder="AAAA"
      maxLength={4}
      required
      style={inputStyle}
      onChange={(e) => {
        e.currentTarget.value = normalizeNumeric(e.currentTarget.value).slice(0, 4);

        const giorno =
          (document.getElementById('dataNascitaGiorno') as HTMLInputElement | null)
            ?.value || '';
        const mese =
          (document.getElementById('dataNascitaMese') as HTMLInputElement | null)
            ?.value || '';
        const anno = e.currentTarget.value || '';

        const hiddenInput = document.getElementById(
          'dataNascita'
        ) as HTMLInputElement | null;

        if (hiddenInput) {
          if (giorno.length === 2 && mese.length === 2 && anno.length === 4) {
            hiddenInput.value = `${anno}-${mese}-${giorno}`;
          } else {
            hiddenInput.value = '';
          }
        }
      }}
      onBlur={() => {
        const giorno =
          (document.getElementById('dataNascitaGiorno') as HTMLInputElement | null)
            ?.value || '';
        const mese =
          (document.getElementById('dataNascitaMese') as HTMLInputElement | null)
            ?.value || '';
        const anno =
          (document.getElementById('dataNascitaAnno') as HTMLInputElement | null)
            ?.value || '';

        const hiddenInput = document.getElementById(
          'dataNascita'
        ) as HTMLInputElement | null;

        if (hiddenInput) {
          if (giorno.length === 2 && mese.length === 2 && anno.length === 4) {
            hiddenInput.value = `${anno}-${mese}-${giorno}`;
          } else {
            hiddenInput.value = '';
          }
        }
      }}
    />
  </div>

  <input id="dataNascita" name="dataNascita" type="hidden" required />
</div>

                    <div>
                      <label htmlFor="nascitaSocio" style={labelStyle}>
                        Stato di nascita
                      </label>
                      <select
                        id="nascitaSocio"
                        name="nascitaSocio"
                        required
                        value={nascitaSocio}
                        onChange={(e) => setNascitaSocio(e.target.value)}
                        style={inputStyle}
                      >
                        <option value=""></option>
                        <option value="italia">Italia</option>
                        <option value="estero">Estero</option>
                      </select>
                    </div>
                  </div>

                  {nascitaSocio === 'italia' && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 20,
                      }}
                    >
                      <div>
                        <label htmlFor="luogoNascita" style={labelStyle}>
                          Comune di nascita
                        </label>
                        <input
                          id="luogoNascita"
                          name="luogoNascita"
                          type="text"
                          required={nascitaSocio === 'italia'}
                          style={inputStyle}
                          onBlur={(e) => {
                            e.currentTarget.value = toTitleCase(e.currentTarget.value);
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="provinciaNascita" style={labelStyle}>
                          Provincia di nascita
                        </label>
                        <input
                          id="provinciaNascita"
                          name="provinciaNascita"
                          type="text"
                          required={nascitaSocio === 'italia'}
                          maxLength={2}
                          style={inputStyle}
                          onChange={(e) => {
                            e.currentTarget.value = normalizeProvince(
                              e.currentTarget.value
                            );
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {nascitaSocio === 'estero' && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 20,
                      }}
                    >
                      <div>
                        <label htmlFor="statoNascitaEstero" style={labelStyle}>
                          Stato estero di nascita
                        </label>
                        <input
                          id="statoNascitaEstero"
                          name="statoNascitaEstero"
                          type="text"
                          required={nascitaSocio === 'estero'}
                          style={inputStyle}
                          onBlur={(e) => {
                            e.currentTarget.value = toTitleCase(e.currentTarget.value);
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="cittaNascitaEstero" style={labelStyle}>
                          Città estera di nascita
                        </label>
                        <input
                          id="cittaNascitaEstero"
                          name="cittaNascitaEstero"
                          type="text"
                          required={nascitaSocio === 'estero'}
                          style={inputStyle}
                          onBlur={(e) => {
                            e.currentTarget.value = toTitleCase(e.currentTarget.value);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 20,
                    }}
                  >
                    <div>
                      <label htmlFor="codiceFiscale" style={labelStyle}>
                        Codice fiscale
                      </label>
                      <input
                        id="codiceFiscale"
                        name="codiceFiscale"
                        type="text"
                        required
                        minLength={16}
                        maxLength={16}
                        pattern="[A-Z0-9]{16}"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                        title="Il codice fiscale deve contenere esattamente 16 caratteri."
                        style={inputStyle}
                        onChange={(e) => {
                          e.currentTarget.value = normalizeCodiceFiscale(
                            e.currentTarget.value
                          );
                        }}
                        onBlur={(e) => {
                          const value = normalizeCodiceFiscale(e.currentTarget.value);
                          e.currentTarget.value = value;

                          if (!isValidCodiceFiscale(value)) {
                            setErroreCfSocio('Codice fiscale del socio non valido.');
                          } else {
                            setErroreCfSocio('');
                          }
                        }}
                      />
                      {erroreCfSocio && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 14,
                            color: '#b42318',
                          }}
                        >
                          {erroreCfSocio}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" style={labelStyle}>
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        style={inputStyle}
                        onBlur={(e) => {
                          e.currentTarget.value = normalizeEmail(e.currentTarget.value);
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 20,
                    }}
                  >
                    <div>
                      <label htmlFor="telefono" style={labelStyle}>
                        Telefono
                      </label>
                      <input
                        id="telefono"
                        name="telefono"
                        type="text"
                        required
                        inputMode="numeric"
                        style={inputStyle}
                        onChange={(e) => {
                          e.currentTarget.value = normalizeNumeric(
                            e.currentTarget.value
                          );
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="minorenne" style={labelStyle}>
                        Il socio è minorenne?
                      </label>
                      <select
                        id="minorenne"
                        name="minorenne"
                        required
                        value={minorenne}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMinorenne(value);
                          setChiPaga('');
                        }}
                        style={inputStyle}
                      >
                        <option value="">Seleziona</option>
                        <option value="no">No</option>
                        <option value="si">Sì</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: 28,
                }}
              >
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: 24,
                    fontSize: 28,
                    color: '#111827',
                  }}
                >
                  Residenza del socio
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gap: 20,
                  }}
                >
                  <div>
                    <label htmlFor="indirizzo" style={labelStyle}>
                      Via / indirizzo
                    </label>
                    <input
                      id="indirizzo"
                      name="indirizzo"
                      type="text"
                      required
                      style={inputStyle}
                      onBlur={(e) => {
                        e.currentTarget.value = toTitleCase(e.currentTarget.value);
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 20,
                    }}
                  >
                    <div>
                      <label htmlFor="cap" style={labelStyle}>
                        CAP
                      </label>
                      <input
                        id="cap"
                        name="cap"
                        type="text"
                        required
                        inputMode="numeric"
                        maxLength={5}
                        style={inputStyle}
                        onChange={(e) => {
                          e.currentTarget.value = normalizeNumeric(
                            e.currentTarget.value
                          ).slice(0, 5);
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="comune" style={labelStyle}>
                        Città
                      </label>
                      <input
                        id="comune"
                        name="comune"
                        type="text"
                        required
                        style={inputStyle}
                        onBlur={(e) => {
                          e.currentTarget.value = toTitleCase(e.currentTarget.value);
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="provincia" style={labelStyle}>
                        Provincia
                      </label>
                      <input
                        id="provincia"
                        name="provincia"
                        type="text"
                        required
                        maxLength={2}
                        style={inputStyle}
                        onChange={(e) => {
                          e.currentTarget.value = normalizeProvince(
                            e.currentTarget.value
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {minorenne === 'si' && (
                <section
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: 28,
                  }}
                >
                  <h2
                    style={{
                      marginTop: 0,
                      marginBottom: 24,
                      fontSize: 28,
                      color: '#111827',
                    }}
                  >
                    Dati del tutore
                  </h2>

                  <div
                    style={{
                      display: 'grid',
                      gap: 20,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 20,
                      }}
                    >
                      <div>
                        <label htmlFor="tutoreNome" style={labelStyle}>
                          Nome
                        </label>
                        <input
                          id="tutoreNome"
                          name="tutoreNome"
                          type="text"
                          required={minorenne === 'si'}
                          style={inputStyle}
                          onBlur={(e) => {
                            e.currentTarget.value = toTitleCase(e.currentTarget.value);
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="tutoreCognome" style={labelStyle}>
                          Cognome
                        </label>
                        <input
                          id="tutoreCognome"
                          name="tutoreCognome"
                          type="text"
                          required={minorenne === 'si'}
                          style={inputStyle}
                          onBlur={(e) => {
                            e.currentTarget.value = toTitleCase(e.currentTarget.value);
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 20,
                      }}
                    >
                      <div>
  <label htmlFor="tutoreDataNascitaGiorno" style={labelStyle}>
    Data di nascita
  </label>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '92px 92px minmax(120px, 1fr)',
      gap: 12,
    }}
  >
    <input
      id="tutoreDataNascitaGiorno"
      name="tutoreDataNascitaGiorno"
      type="text"
      inputMode="numeric"
      placeholder="GG"
      maxLength={2}
      required={minorenne === 'si'}
      style={inputStyle}
      onChange={(e) => {
        e.currentTarget.value = normalizeNumeric(e.currentTarget.value).slice(0, 2);
      }}
      onInput={(e) => {
        const target = e.currentTarget;
        if (target.value.length === 2) {
          const meseInput = document.getElementById(
            'tutoreDataNascitaMese'
          ) as HTMLInputElement | null;
          meseInput?.focus();
        }
      }}
    />

    <input
      id="tutoreDataNascitaMese"
      name="tutoreDataNascitaMese"
      type="text"
      inputMode="numeric"
      placeholder="MM"
      maxLength={2}
      required={minorenne === 'si'}
      style={inputStyle}
      onChange={(e) => {
        e.currentTarget.value = normalizeNumeric(e.currentTarget.value).slice(0, 2);
      }}
      onInput={(e) => {
        const target = e.currentTarget;
        if (target.value.length === 2) {
          const annoInput = document.getElementById(
            'tutoreDataNascitaAnno'
          ) as HTMLInputElement | null;
          annoInput?.focus();
        }
      }}
    />

    <input
      id="tutoreDataNascitaAnno"
      name="tutoreDataNascitaAnno"
      type="text"
      inputMode="numeric"
      placeholder="AAAA"
      maxLength={4}
      required={minorenne === 'si'}
      style={inputStyle}
      onChange={(e) => {
        e.currentTarget.value = normalizeNumeric(e.currentTarget.value).slice(0, 4);

        const giorno =
          (document.getElementById('tutoreDataNascitaGiorno') as HTMLInputElement | null)
            ?.value || '';
        const mese =
          (document.getElementById('tutoreDataNascitaMese') as HTMLInputElement | null)
            ?.value || '';
        const anno = e.currentTarget.value || '';

        const hiddenInput = document.getElementById(
          'tutoreDataNascita'
        ) as HTMLInputElement | null;

        if (hiddenInput) {
          if (giorno.length === 2 && mese.length === 2 && anno.length === 4) {
            hiddenInput.value = `${anno}-${mese}-${giorno}`;
          } else {
            hiddenInput.value = '';
          }
        }
      }}
      onBlur={() => {
        const giorno =
          (document.getElementById('tutoreDataNascitaGiorno') as HTMLInputElement | null)
            ?.value || '';
        const mese =
          (document.getElementById('tutoreDataNascitaMese') as HTMLInputElement | null)
            ?.value || '';
        const anno =
          (document.getElementById('tutoreDataNascitaAnno') as HTMLInputElement | null)
            ?.value || '';

        const hiddenInput = document.getElementById(
          'tutoreDataNascita'
        ) as HTMLInputElement | null;

        if (hiddenInput) {
          if (giorno.length === 2 && mese.length === 2 && anno.length === 4) {
            hiddenInput.value = `${anno}-${mese}-${giorno}`;
          } else {
            hiddenInput.value = '';
          }
        }
      }}
    />
  </div>

  <input
    id="tutoreDataNascita"
    name="tutoreDataNascita"
    type="hidden"
    required={minorenne === 'si'}
  />
</div>

                      <div>
                        <label htmlFor="nascitaTutore" style={labelStyle}>
                          Stato di nascita
                        </label>
                        <select
                          id="nascitaTutore"
                          name="nascitaTutore"
                          required={minorenne === 'si'}
                          value={nascitaTutore}
                          onChange={(e) => setNascitaTutore(e.target.value)}
                          style={inputStyle}
                        >
                          <option value=""></option>
                          <option value="italia">Italia</option>
                          <option value="estero">Estero</option>
                        </select>
                      </div>
                    </div>

                    {nascitaTutore === 'italia' && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: 20,
                        }}
                      >
                        <div>
                          <label htmlFor="tutoreLuogoNascita" style={labelStyle}>
                            Comune di nascita
                          </label>
                          <input
                            id="tutoreLuogoNascita"
                            name="tutoreLuogoNascita"
                            type="text"
                            required={nascitaTutore === 'italia'}
                            style={inputStyle}
                            onBlur={(e) => {
                              e.currentTarget.value = toTitleCase(e.currentTarget.value);
                            }}
                          />
                        </div>

                        <div>
                          <label htmlFor="tutoreProvinciaNascita" style={labelStyle}>
                            Provincia di nascita
                          </label>
                          <input
                            id="tutoreProvinciaNascita"
                            name="tutoreProvinciaNascita"
                            type="text"
                            required={nascitaTutore === 'italia'}
                            maxLength={2}
                            style={inputStyle}
                            onChange={(e) => {
                              e.currentTarget.value = normalizeProvince(
                                e.currentTarget.value
                              );
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {nascitaTutore === 'estero' && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: 20,
                        }}
                      >
                        <div>
                          <label htmlFor="tutoreStatoNascitaEstero" style={labelStyle}>
                            Stato estero di nascita
                          </label>
                          <input
                            id="tutoreStatoNascitaEstero"
                            name="tutoreStatoNascitaEstero"
                            type="text"
                            required={nascitaTutore === 'estero'}
                            style={inputStyle}
                            onBlur={(e) => {
                              e.currentTarget.value = toTitleCase(e.currentTarget.value);
                            }}
                          />
                        </div>

                        <div>
                          <label htmlFor="tutoreCittaNascitaEstero" style={labelStyle}>
                            Città estera di nascita
                          </label>
                          <input
                            id="tutoreCittaNascitaEstero"
                            name="tutoreCittaNascitaEstero"
                            type="text"
                            required={nascitaTutore === 'estero'}
                            style={inputStyle}
                            onBlur={(e) => {
                              e.currentTarget.value = toTitleCase(e.currentTarget.value);
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 20,
                      }}
                    >
                      <div>
                        <label htmlFor="tutoreCodiceFiscale" style={labelStyle}>
                          Codice fiscale
                        </label>
                        <input
                          id="tutoreCodiceFiscale"
                          name="tutoreCodiceFiscale"
                          type="text"
                          required={minorenne === 'si'}
                          minLength={16}
                          maxLength={16}
                          pattern="[A-Z0-9]{16}"
                          autoCapitalize="characters"
                          autoCorrect="off"
                          spellCheck={false}
                          title="Il codice fiscale deve contenere esattamente 16 caratteri."
                          style={inputStyle}
                          onChange={(e) => {
                            e.currentTarget.value = normalizeCodiceFiscale(
                              e.currentTarget.value
                            );
                          }}
                          onBlur={(e) => {
                            const value = normalizeCodiceFiscale(e.currentTarget.value);
                            e.currentTarget.value = value;

                            if (!isValidCodiceFiscale(value)) {
                              setErroreCfTutore('Codice fiscale del tutore non valido.');
                            } else {
                              setErroreCfTutore('');
                            }
                          }}
                        />
                        {erroreCfTutore && (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 14,
                              color: '#b42318',
                            }}
                          >
                            {erroreCfTutore}
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="tutoreTelefono" style={labelStyle}>
                          Telefono
                        </label>
                        <input
                          id="tutoreTelefono"
                          name="tutoreTelefono"
                          type="text"
                          required={minorenne === 'si'}
                          inputMode="numeric"
                          style={inputStyle}
                          onChange={(e) => {
                            e.currentTarget.value = normalizeNumeric(
                              e.currentTarget.value
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="tutoreEmail" style={labelStyle}>
                        Email
                      </label>
                      <input
                        id="tutoreEmail"
                        name="tutoreEmail"
                        type="email"
                        required={minorenne === 'si'}
                        style={inputStyle}
                        onBlur={(e) => {
                          e.currentTarget.value = normalizeEmail(e.currentTarget.value);
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="tutoreIndirizzo" style={labelStyle}>
                        Via / indirizzo
                      </label>
                      <input
                        id="tutoreIndirizzo"
                        name="tutoreIndirizzo"
                        type="text"
                        required={minorenne === 'si'}
                        style={inputStyle}
                        onBlur={(e) => {
                          e.currentTarget.value = toTitleCase(e.currentTarget.value);
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 20,
                      }}
                    >
                      <div>
                        <label htmlFor="tutoreCap" style={labelStyle}>
                          CAP
                        </label>
                        <input
                          id="tutoreCap"
                          name="tutoreCap"
                          type="text"
                          required={minorenne === 'si'}
                          inputMode="numeric"
                          maxLength={5}
                          style={inputStyle}
                          onChange={(e) => {
                            e.currentTarget.value = normalizeNumeric(
                              e.currentTarget.value
                            ).slice(0, 5);
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="tutoreComune" style={labelStyle}>
                          Città
                        </label>
                        <input
                          id="tutoreComune"
                          name="tutoreComune"
                          type="text"
                          required={minorenne === 'si'}
                          style={inputStyle}
                          onBlur={(e) => {
                            e.currentTarget.value = toTitleCase(e.currentTarget.value);
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="tutoreProvincia" style={labelStyle}>
                          Provincia
                        </label>
                        <input
                          id="tutoreProvincia"
                          name="tutoreProvincia"
                          type="text"
                          required={minorenne === 'si'}
                          maxLength={2}
                          style={inputStyle}
                          onChange={(e) => {
                            e.currentTarget.value = normalizeProvince(
                              e.currentTarget.value
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: 28,
                }}
              >
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: 24,
                    fontSize: 28,
                    color: '#111827',
                  }}
                >
                  Consensi
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gap: 18,
                  }}
                >
                  {minorenne === 'si' ? (
                    <>
                      <label style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          name="tutoreLegaleMinore"
                          required
                          style={{ marginTop: 4 }}
                        />
                        <span>Dichiaro di essere il tutore legale del minore</span>
                      </label>

                      <label style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          name="privacyMinore"
                          required
                          style={{ marginTop: 4 }}
                        />
                        <span>
                          Dichiaro di aver letto e accettato l’
                          <a
                            className="inline-doc-link"
                            href="https://www.angelideinavigli.org/wp-content/uploads/2026/03/Informativa-Privacy_WEB.pdf"
                            target="_blank"
                            rel="noreferrer"
                          >
                            informativa Privacy
                          </a>{' '}
                          per conto del minore
                        </span>
                      </label>

                      <label style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          name="statutoMinore"
                          required
                          style={{ marginTop: 4 }}
                        />
                        <span>
                          Dichiaro di aver letto e accettato lo{' '}
                          <a
                            className="inline-doc-link"
                            href="https://www.angelideinavigli.org/wp-content/uploads/2026/03/Statuto_Rev.130326.pdf"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Statuto dell’associazione
                          </a>
                        </span>
                      </label>

                      <label style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          name="trattamentoDatiMinore"
                          required
                          style={{ marginTop: 4 }}
                        />
                        <span>
                          Acconsento al{' '}
                          <a
                            className="inline-doc-link"
                            href="https://www.angelideinavigli.org/wp-content/uploads/2026/03/Trattamento-dati_WEB.pdf"
                            target="_blank"
                            rel="noreferrer"
                          >
                            trattamento dei dati
                          </a>{' '}
                          del minore per finalità associative e per la gestione del Registro
                          Volontari
                        </span>
                      </label>
                    </>
                  ) : (
                    <>
                      <label style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          name="privacyAdulto"
                          required
                          style={{ marginTop: 4 }}
                        />
                        <span>
                          Ho letto e accettato l’
                          <a
                            className="inline-doc-link"
                            href="https://www.angelideinavigli.org/wp-content/uploads/2026/03/Informativa-Privacy_WEB.pdf"
                            target="_blank"
                            rel="noreferrer"
                          >
                            informativa privacy
                          </a>
                        </span>
                      </label>

                      <label style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          name="statutoAdulto"
                          required
                          style={{ marginTop: 4 }}
                        />
                        <span>
                          Ho letto e accettato lo{' '}
                          <a
                            className="inline-doc-link"
                            href="https://www.angelideinavigli.org/wp-content/uploads/2026/03/Statuto_Rev.130326.pdf"
                            target="_blank"
                            rel="noreferrer"
                          >
                            statuto dell’associazione
                          </a>
                        </span>
                      </label>

                      <label style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          name="trattamentoDatiAdulto"
                          required
                          style={{ marginTop: 4 }}
                        />
                        <span>
                          Consento al{' '}
                          <a
                            className="inline-doc-link"
                            href="https://www.angelideinavigli.org/wp-content/uploads/2026/03/Trattamento-dati_WEB.pdf"
                            target="_blank"
                            rel="noreferrer"
                          >
                            trattamento dati
                          </a>{' '}
                          per finalità associative
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </section>

              {minorenne !== '' && (
                <section
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: 28,
                  }}
                >
                  <h2
                    style={{
                      marginTop: 0,
                      marginBottom: 24,
                      fontSize: 28,
                      color: '#111827',
                    }}
                  >
                    Chi effettua il pagamento?
                  </h2>

                  <div>
                    <label htmlFor="chiPaga" style={labelStyle}>
                      Seleziona
                    </label>
                    <select
                      id="chiPaga"
                      name="chiPaga"
                      required
                      value={chiPaga}
                      onChange={(e) => setChiPaga(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Seleziona</option>
                      {opzioniPagamento.map((opzione) => (
                        <option key={opzione.value} value={opzione.value}>
                          {opzione.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>
              )}

              {chiPaga === 'altro' && (
                <section
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: 28,
                  }}
                >
                  <h2
                    style={{
                      marginTop: 0,
                      marginBottom: 24,
                      fontSize: 28,
                      color: '#111827',
                    }}
                  >
                    Dati per la ricevuta
                  </h2>

                  <div
                    style={{
                      display: 'grid',
                      gap: 20,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 20,
                      }}
                    >
                      <div>
                        <label htmlFor="pagatoreNome" style={labelStyle}>
                          Nome
                        </label>
                        <input
                          id="pagatoreNome"
                          name="pagatoreNome"
                          type="text"
                          required={chiPaga === 'altro'}
                          style={inputStyle}
                          onBlur={(e) => {
                            e.currentTarget.value = toTitleCase(e.currentTarget.value);
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="pagatoreCognome" style={labelStyle}>
                          Cognome
                        </label>
                        <input
                          id="pagatoreCognome"
                          name="pagatoreCognome"
                          type="text"
                          required={chiPaga === 'altro'}
                          style={inputStyle}
                          onBlur={(e) => {
                            e.currentTarget.value = toTitleCase(e.currentTarget.value);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pagatoreIndirizzo" style={labelStyle}>
                        Via / indirizzo
                      </label>
                      <input
                        id="pagatoreIndirizzo"
                        name="pagatoreIndirizzo"
                        type="text"
                        required={chiPaga === 'altro'}
                        style={inputStyle}
                        onBlur={(e) => {
                          e.currentTarget.value = toTitleCase(e.currentTarget.value);
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 20,
                      }}
                    >
                      <div>
                        <label htmlFor="pagatoreCap" style={labelStyle}>
                          CAP
                        </label>
                        <input
                          id="pagatoreCap"
                          name="pagatoreCap"
                          type="text"
                          required={chiPaga === 'altro'}
                          inputMode="numeric"
                          maxLength={5}
                          style={inputStyle}
                          onChange={(e) => {
                            e.currentTarget.value = normalizeNumeric(
                              e.currentTarget.value
                            ).slice(0, 5);
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="pagatoreComune" style={labelStyle}>
                          Città
                        </label>
                        <input
                          id="pagatoreComune"
                          name="pagatoreComune"
                          type="text"
                          required={chiPaga === 'altro'}
                          style={inputStyle}
                          onBlur={(e) => {
                            e.currentTarget.value = toTitleCase(e.currentTarget.value);
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="pagatoreProvincia" style={labelStyle}>
                          Provincia
                        </label>
                        <input
                          id="pagatoreProvincia"
                          name="pagatoreProvincia"
                          type="text"
                          required={chiPaga === 'altro'}
                          maxLength={2}
                          style={inputStyle}
                          onChange={(e) => {
                            e.currentTarget.value = normalizeProvince(
                              e.currentTarget.value
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pagatoreCfPiva" style={labelStyle}>
                        Codice fiscale / P.IVA
                      </label>
                      <input
                        id="pagatoreCfPiva"
                        name="pagatoreCfPiva"
                        type="text"
                        required={chiPaga === 'altro'}
                        style={inputStyle}
                        onChange={(e) => {
                          e.currentTarget.value = e.currentTarget.value.toUpperCase();
                          setErroreCfPagatore('');
                        }}
                        onBlur={(e) => {
                          const value = e.currentTarget.value.trim().toUpperCase();
                          e.currentTarget.value = value;

                          if (!isValidCfOrPartitaIva(value)) {
                            setErroreCfPagatore(
                              'Inserisci un codice fiscale valido oppure una partita IVA valida.'
                            );
                          } else {
                            setErroreCfPagatore('');
                          }
                        }}
                      />
                      {erroreCfPagatore && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 14,
                            color: '#b42318',
                          }}
                        >
                          {erroreCfPagatore}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <button className="button" type="submit">
                Continua
              </button>
            </form>
          </section>

          {step === 2 && (
            <section
              style={{
                background: '#ffffff',
                borderRadius: 0,
                padding: '32px 28px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 24,
                  fontSize: 28,
                  color: '#111827',
                }}
              >
                Riepilogo dati
              </h2>

              <div
                style={{
                  display: 'grid',
                  gap: 14,
                  marginBottom: 28,
                }}
              >
                <div><strong>Nome:</strong> {riepilogo.nome}</div>
                <div><strong>Cognome:</strong> {riepilogo.cognome}</div>
                <div><strong>Data di nascita:</strong> {riepilogo.dataNascita}</div>
                <div><strong>Codice fiscale:</strong> {riepilogo.codiceFiscale}</div>
                <div><strong>Email:</strong> {riepilogo.email}</div>
                <div><strong>Telefono:</strong> {riepilogo.telefono}</div>
                <div><strong>Indirizzo:</strong> {riepilogo.indirizzo}</div>
                <div><strong>CAP:</strong> {riepilogo.cap}</div>
                <div><strong>Città:</strong> {riepilogo.comune}</div>
                <div><strong>Provincia:</strong> {riepilogo.provincia}</div>
                <div><strong>Minorenne:</strong> {riepilogo.minorenne === 'si' ? 'Sì' : 'No'}</div>

                {riepilogo.minorenne === 'si' && (
                  <>
                    <div><strong>Tutore nome:</strong> {riepilogo.tutoreNome}</div>
                    <div><strong>Tutore cognome:</strong> {riepilogo.tutoreCognome}</div>
                    <div><strong>Tutore data di nascita:</strong> {riepilogo.tutoreDataNascita}</div>
                    <div><strong>Tutore codice fiscale:</strong> {riepilogo.tutoreCodiceFiscale}</div>
                    <div><strong>Tutore email:</strong> {riepilogo.tutoreEmail}</div>
                    <div><strong>Tutore telefono:</strong> {riepilogo.tutoreTelefono}</div>
                  </>
                )}

                <div><strong>Chi effettua il pagamento:</strong> {riepilogo.chiPaga}</div>

                {riepilogo.chiPaga === 'altro' && (
                  <>
                    <div><strong>Pagatore nome:</strong> {riepilogo.pagatoreNome}</div>
                    <div><strong>Pagatore cognome:</strong> {riepilogo.pagatoreCognome}</div>
                    <div><strong>Pagatore CF / P.IVA:</strong> {riepilogo.pagatoreCfPiva}</div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Indietro
                </button>

                <button
                  className="button"
                  type="button"
                  onClick={() => setStep(3)}
                >
                  Vai al pagamento
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
  <section
    style={{
      background: '#ffffff',
      borderRadius: 0,
      padding: '32px 28px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    }}
  >
    <h2
      style={{
        marginTop: 0,
        marginBottom: 24,
        fontSize: 28,
        color: '#111827',
      }}
    >
      Scegli il metodo di pagamento
    </h2>

    <div
      style={{
        display: 'grid',
        gap: 18,
        marginBottom: 28,
        color: '#374151',
        lineHeight: 1.7,
        fontSize: 16,
      }}
    >
      <p style={{ margin: 0 }}>
        Seleziona come desideri pagare la quota associativa.
      </p>

      <div
        style={{
          padding: '20px 18px',
          background: '#f7f7f5',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <strong>Socio:</strong> {riepilogo.nome} {riepilogo.cognome}
        </div>

        <div style={{ marginBottom: 8 }}>
          <strong>Chi effettua il pagamento:</strong> {riepilogo.chiPaga || '-'}
        </div>

        {riepilogo.chiPaga === 'altro' && (
          <div>
            <strong>Intestatario ricevuta:</strong> {riepilogo.pagatoreNome} {riepilogo.pagatoreCognome}
          </div>
        )}
      </div>
    </div>

    {submitError && (
      <div style={{ color: '#b42318', marginBottom: 16 }}>{submitError}</div>
    )}

    {submitSuccess && (
      <div style={{ color: '#027a48', marginBottom: 16 }}>{submitSuccess}</div>
    )}

    <div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 16,
    marginBottom: 16,
    alignItems: 'stretch',
  }}
>
  <div
    style={{
      minHeight: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {paypalClientId ? (
      <div style={{ width: '100%', maxWidth: 360 }}>
        <PayPalButtons
  fundingSource="paypal"
  style={{
    layout: 'vertical',
    shape: 'rect',
    label: 'paypal',
    height: 55,
  }}
  disabled={isPending || paypalProcessing}
  createOrder={async () => {
    setSubmitError('');
    setSubmitSuccess('');
    setMetodoPagamento('paypal');
    setPaypalProcessing(false);

    const importo = riepilogo.minorenne === 'si' ? 20 : 30;

    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        importo,
        minorenne: riepilogo.minorenne,
        nome: riepilogo.nome,
        cognome: riepilogo.cognome,
        email: riepilogo.email,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.ok || !data?.orderID) {
      throw new Error(data?.error || 'Errore creazione ordine PayPal.');
    }

    console.log('PAYPAL orderID', data.orderID);

    return data.orderID;
  }}
  onApprove={async (data) => {
  console.log('PAYPAL onApprove', data);

  if (paypalProcessing) return;

  setSubmitError('');
  setSubmitSuccess('');
  setMetodoPagamento('paypal');
  setPaypalProcessing(true);

    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
        }),
      });

      const captureData = await response.json();

      if (!response.ok || !captureData?.ok || !captureData?.captureID) {
        setSubmitError(
          captureData?.error || 'Errore conferma pagamento PayPal.'
        );
        setPaypalProcessing(false);
        return;
      }

      handleConfermaIscrizione(captureData.captureID);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Errore PayPal in fase di conferma.'
      );
      setPaypalProcessing(false);
    }
  }}
  onCancel={() => {
    setPaypalProcessing(false);
    setSubmitError('Pagamento PayPal annullato.');
  }}
  onError={(err) => {
  console.error('PAYPAL onError', err);
  setPaypalProcessing(false);
  setSubmitError(
    err instanceof Error ? err.message : 'Errore PayPal.'
  );
}}
/>
      </div>
    ) : (
      <div
        style={{
          width: '100%',
          border: '1px solid #fecaca',
          background: '#fef2f2',
          color: '#991b1b',
          padding: '14px 16px',
          textAlign: 'center',
        }}
      >
        Configurazione PayPal mancante.
      </div>
    )}
  </div>

  <button
  type="button"
  onClick={() => {
    setSubmitError('');
    setSubmitSuccess('');
    setMetodoPagamento('bonifico');
    setShowBonificoModal(true); 
  }}
  disabled={isPending || paypalProcessing}
  style={{
    width: '100%',
    maxWidth: 360,
    height: 55,
    margin: '0 auto',
    marginTop: 1,
    border: 'none',
    borderRadius: 4,
    background: '#003085',
    color: '#ffffff',
    cursor: isPending || paypalProcessing ? 'not-allowed' : 'pointer',
    opacity: isPending || paypalProcessing ? 0.7 : 1,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontSize: 22,
    fontWeight: 700,
    fontFamily:
      'Roboto, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    alignSelf: 'center',
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path d="M3 10h18" />
    <path d="M5 10V8l7-4 7 4v2" />
    <path d="M6 10v8" />
    <path d="M10 10v8" />
    <path d="M14 10v8" />
    <path d="M18 10v8" />
    <path d="M4 18h16" />
  </svg>

  <span style={{ whiteSpace: 'nowrap' }}>Bonifico Bancario</span>
</button>

</div>

    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <button
        className="button secondary"
        type="button"
        onClick={() => setStep(2)}
        disabled={isPending}
      >
        Indietro
      </button>
    </div>
  </section>
)}

{showBonificoCopiedModal && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(17, 24, 39, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      zIndex: 1100,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        background: '#ffffff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        padding: '28px 24px',
      }}
    >

      <h3
        style={{
          marginTop: 0,
          marginBottom: 16,
          fontSize: 24,
          color: '#111827',
          paddingRight: 56,
        }}
      >
        IBAN copiato
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: 16,
          lineHeight: 1.7,
          color: '#374151',
        }}
      >
        L&apos;IBAN è stato copiato correttamente.
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 24,
        }}
      >
        <button
          className="button"
          type="button"
          onClick={() => setShowBonificoCopiedModal(false)}
        >
          Ok
        </button>
      </div>
    </div>
  </div>
)}

{showBonificoEsitoModal && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(17, 24, 39, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      zIndex: 1100,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 520,
        background: '#ffffff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        padding: '28px 24px',
      }}
    >
      <Link
        href="/iscriviti"
        aria-label="Chiudi"
        className="button secondary"
        style={closeButtonStyle}
        onClick={() => setShowBonificoEsitoModal(false)}
      >
        ✕
      </Link>

      <h3
        style={{
          marginTop: 0,
          marginBottom: 16,
          fontSize: 24,
          color: '#111827',
          paddingRight: 56,
        }}
      >
        Richiesta inoltrata
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: 16,
          lineHeight: 1.7,
          color: '#374151',
        }}
      >
        La tua richiesta di iscrizione è stata inoltrata. L&apos;iscrizione sarà
        attiva solo dopo la verifica dell’avvenuto pagamento. Dopo la conferma del
        pagamento, ti invieremo una tessera provvisoria e tutte le indicazioni
        utili per partecipare alle attività dell’associazione.
      </p>
    </div>
  </div>
)}

{showBonificoModal && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(17, 24, 39, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      zIndex: 1000,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 760,
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#ffffff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        padding: '32px 28px',
      }}
    >
      <button
        type="button"
        className="button secondary"
        onClick={() => setShowBonificoModal(false)}
        style={closeButtonStyle}
        aria-label="Chiudi"
      >
        ✕
      </button>

      <h2
        style={{
          marginTop: 0,
          marginBottom: 24,
          fontSize: 28,
          color: '#111827',
          paddingRight: 56,
        }}
      >
        Pagamento con bonifico bancario
      </h2>

      <div
        style={{
          display: 'grid',
          gap: 18,
          color: '#374151',
          lineHeight: 1.7,
          fontSize: 16,
        }}
      >
        <p style={{ margin: 0 }}>
          Stai inviando la tua richiesta di iscrizione ad Angeli dei Navigli ODV.
        </p>

        <p style={{ margin: 0 }}>
          Per completare l’iscrizione, dovrai effettuare un bonifico bancario di{' '}
          <strong>euro {riepilogo.minorenne === 'si' ? '20' : '30'}</strong>, intestato a:
        </p>

        <div
          style={{
            padding: '20px 18px',
            background: '#f7f7f5',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: 8,
              }}
            >
              <div>
                <strong>Angeli dei Navigli ODV</strong>
              </div>

              <div>
                <strong>IBAN:</strong> IT78F0623001621000040503267
              </div>

              <div>
                <strong>Causale:</strong> Iscrizione {riepilogo.nome} {riepilogo.cognome}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                aria-label="Stampa"
                title="Stampa"
                style={bonificoCleanIconButtonStyle}
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={18} strokeWidth={1.9} />
              </button>

              <button
                type="button"
                aria-label="Inoltra"
                title="Inoltra"
                style={bonificoCleanIconButtonStyle}
                onClick={() => {
                  const testo = [
                    'Pagamento iscrizione Angeli dei Navigli ODV',
                    '',
                    `Importo: euro ${riepilogo.minorenne === 'si' ? '20' : '30'}`,
                    'Intestatario: Angeli dei Navigli ODV',
                    'IBAN: IT78F0623001621000040503267',
                    `Causale: Iscrizione ${riepilogo.nome} ${riepilogo.cognome}`,
                  ].join('\n');

                  window.open(`https://wa.me/?text=${encodeURIComponent(testo)}`, '_blank');
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 16V4" />
                  <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
                  <path d="M8 11H7a3 3 0 0 0-3 3v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2a3 3 0 0 0-3-3h-1" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Copia IBAN"
                title="Copia IBAN"
                style={bonificoCleanIconButtonStyle}
                onClick={() => {
                  const iban = 'IT78F0623001621000040503267';

                  try {
                    const input = document.createElement('input');
                    input.value = iban;
                    document.body.appendChild(input);
                    input.select();
                    input.setSelectionRange(0, 99999);
                    document.execCommand('copy');
                    document.body.removeChild(input);

                    setBonificoCopied(true);
                    setShowBonificoCopiedModal(true);
                  } catch (error) {
                    console.error('Errore copia IBAN', error);
                  }
                }}
              >
                <Copy size={18} strokeWidth={1.9} />
              </button>
            </div>
          </div>
        </div>

        <p style={{ margin: 0 }}>
  Sei sicuro di voler procedere con l&apos;iscrizione?
</p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 28,
        }}
      >
        <button
  className="button"
  type="button"
  onClick={() => {
    setShowBonificoModal(false);
    handleConfermaIscrizione();
  }}
>
  Procedi
</button>
      </div>
    </div>
  </div>
)}

          {step === 4 && (
            <section
              style={{
                background: '#ffffff',
                borderRadius: 0,
                padding: '32px 28px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 24,
                  fontSize: 28,
                  color: '#111827',
                }}
              >
                Pagamento con bonifico bancario
              </h2>

              <div
                style={{
                  display: 'grid',
                  gap: 18,
                  marginBottom: 28,
                  color: '#374151',
                  lineHeight: 1.7,
                  fontSize: 16,
                }}
              >
                <p style={{ margin: 0 }}>
                  La tua quota associativa dovrà essere pagata con bonifico bancario intestato a:
                </p>

                <div
                  style={{
                    padding: '20px 18px',
                    background: '#f7f7f5',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  }}
>
  <div
    style={{
      display: 'grid',
      gap: 8,
    }}
  >
    <div>
      <strong>Angeli dei Navigli ODV</strong>
    </div>

    <div>
      <strong>IBAN:</strong> IT78F0623001621000040503267
    </div>

    <div>
      <strong>Causale:</strong> Iscrizione {riepilogo.nome} {riepilogo.cognome}
    </div>
  </div>

  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    }}
  >
    <button
      type="button"
      aria-label="Salva come PDF"
      title="Salva come PDF"
      style={bonificoMiniIconButtonStyle}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 17V3" />
        <path d="m6 11 6 6 6-6" />
        <path d="M19 21H5" />
      </svg>
    </button>

    <button
      type="button"
      aria-label="Invia su WhatsApp"
      title="Invia su WhatsApp"
      style={bonificoMiniIconButtonStyle}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16.75 13.96c.25.13 1.47.72 1.7.8.23.08.39.12.56-.13.17-.25.65-.8.8-.96.15-.17.3-.19.56-.06.25.13 1.07.39 2.04 1.24.75.67 1.26 1.5 1.41 1.75.15.25.02.39-.11.52-.12.12-.25.3-.37.45-.12.15-.17.25-.25.42-.08.17-.04.32.02.45.06.13.56 1.35.77 1.85.2.48.4.42.56.43.15 0 .32 0 .5-.01.17 0 .45-.06.68-.31.23-.25.87-.85 1-2.07.13-1.22-.8-2.4-.92-2.57-.12-.17-1.75-2.67-4.27-3.74-.6-.26-1.07-.42-1.43-.54-.6-.19-1.15-.16-1.58.08-.48.26-1.55 1.52-1.55 3.71 0 2.19 1.59 4.31 1.81 4.61.22.3 3.12 4.77 7.56 6.69 1.06.46 1.88.73 2.52.93 1.06.34 2.02.29 2.78.18.85-.13 2.62-1.07 2.99-2.1.37-1.03.37-1.91.26-2.1-.11-.19-.4-.3-.84-.52-.44-.22-2.62-1.29-3.02-1.43-.4-.15-.7-.22-.99.22-.29.44-1.14 1.43-1.4 1.72-.26.29-.51.33-.95.11-.44-.22-1.85-.68-3.53-2.18-1.3-1.16-2.18-2.6-2.43-3.04-.25-.44-.03-.68.19-.9.2-.2.44-.51.66-.77.22-.26.29-.44.44-.73.15-.29.07-.55-.04-.77-.11-.22-.99-2.39-1.36-3.27-.36-.87-.73-.75-.99-.76h-.84c-.29 0-.77.11-1.17.55-.4.44-1.54 1.5-1.54 3.65 0 2.15 1.58 4.24 1.8 4.53.22.29 3.11 4.75 7.54 6.66" />
      </svg>
    </button>

    <button
      type="button"
      aria-label="Copia IBAN"
      title="Copia IBAN"
      style={bonificoMiniIconButtonStyle}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  </div>
</div>
                </div>

                <p style={{ margin: 0 }}>
                  La tua iscrizione sarà attiva solo dopo la verifica dell’avvenuto pagamento.
                </p>

                <p style={{ margin: 0 }}>
                  Una volta attivata, riceverai una tessera provvisoria e tutte le informazioni
                  per partecipare alle attività dell’associazione.
                </p>
              </div>

              {submitError && (
                <div style={{ color: '#b42318', marginBottom: 16 }}>{submitError}</div>
              )}

              {submitSuccess && (
                <div style={{ color: '#027a48', marginBottom: 16 }}>{submitSuccess}</div>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={isPending}
                >
                  Indietro
                </button>

                <button
                  className="button"
                  type="button"
                  onClick={() => handleConfermaIscrizione()}
                  disabled={isPending}
                >
                  {isPending ? 'INVIO IN CORSO...' : 'Conferma iscrizione'}
                </button>
              </div>
            </section>
          )}

          {step === 5 && (
            <section
              style={{
                background: '#ffffff',
                borderRadius: 0,
                padding: '32px 28px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 24,
                  fontSize: 28,
                  color: '#111827',
                }}
              >
                {metodoPagamento === 'paypal'
                  ? 'Pagamento completato correttamente'
                  : 'Richiesta inviata correttamente'}
              </h2>

              <div
                style={{
                  display: 'grid',
                  gap: 18,
                  color: '#374151',
                  lineHeight: 1.7,
                  fontSize: 16,
                }}
              >
                {metodoPagamento === 'paypal' ? (
                  <>
                    <p style={{ margin: 0 }}>
                      Il pagamento PayPal è stato completato correttamente.
                    </p>

                    <p style={{ margin: 0 }}>
                      La tua iscrizione ad Angeli dei Navigli è stata confermata con successo.
                    </p>

                    <p style={{ margin: 0 }}>
                      Grazie mille e a presto!
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: 0 }}>
                      La tua richiesta di iscrizione ad Angeli dei Navigli è stata inviata correttamente.
                    </p>

                    <p style={{ margin: 0 }}>
                      L’iscrizione verrà confermata solo dopo aver ricevuto l’accredito della transazione.
                    </p>

                    <p style={{ margin: 0 }}>
                      Grazie mille e a presto!
                    </p>
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </PayPalScriptProvider>
  );
}

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 700,
  color: '#374151',
};

const inputStyle: CSSProperties = {
  width: '100%',
  height: 48,
  borderRadius: 0,
  border: '1px solid #d1d5db',
  padding: '0 14px',
  fontSize: 16,
  background: '#ffffff',
  boxSizing: 'border-box',
};

const checkboxLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  lineHeight: 1.6,
  color: '#374151',
  cursor: 'pointer',
};

const closeButtonStyle: CSSProperties = {
  position: 'absolute',
  top: 20,
  right: 20,
  minWidth: 48,
  height: 48,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  lineHeight: 1,
};
const bonificoMiniIconButtonStyle: CSSProperties = {
  minWidth: 78,
  height: 54,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
  cursor: 'pointer',
  color: '#374151',
  boxSizing: 'border-box',
  padding: '6px 10px',
  borderRadius: 10,
};

const bonificoCleanIconButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  border: 'none',
  background: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#374151',
  boxSizing: 'border-box',
  padding: 0,
};