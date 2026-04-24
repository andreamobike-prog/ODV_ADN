'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUp } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { WalletWalletPassPreview } from '@/components/wallet/WalletWalletPassPreview';
import { buildProviderPassPayload } from '@/lib/wallet/provider/buildProviderPassPayload';
import {
  salvaImpostazioniAction,
  uploadLogoGestionaleAction,
} from './actions';
import type { WalletWalletVisualConfig } from '@/lib/wallet/provider/types';
import { normalizeWalletWalletConfig } from '@/lib/wallet/provider/normalizeWalletWalletConfig';
import { mapHexToWalletWalletPreset } from '@/lib/wallet/provider/mapHexToWalletWalletPreset';

type Props = {
  nomeAssociazione: string;
  sottotitoloAssociazione: string;
  logoGestionaleUrl?: string | null;
  codiceFiscale: string;
  partitaIva: string;
  runtsNumero: string;
  runtsSezione: string;
  runtsDataIscrizione: string;
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  email: string;
  pec: string;
  telefono: string;
  sitoWeb: string;
  iban: string;
  intestatarioConto: string;
  presidenteNome: string;
  testoRicevuta: string;
  ricevutaTestoIntro: string;
  ricevutaTestoAttestazione: string;
  ricevutaTestoNonCorrispettivo: string;
  ricevutaTestoNotaFinale: string;
  bolloAttivo: boolean;
  bolloImporto: number;
  walletConfig: WalletWalletVisualConfig;
};

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function normalizeHexInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return normalized.slice(0, 7);
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateWalletConfig(config: WalletWalletVisualConfig) {
  if (!config.logoText.trim()) {
    return 'Il titolo card e obbligatorio.';
  }

  if (!config.backgroundColor || !HEX_COLOR_PATTERN.test(config.backgroundColor)) {
    return 'Il colore card deve essere un esadecimale valido nel formato #RRGGBB.';
  }

  if (config.logoURL?.trim() && !isHttpsUrl(config.logoURL)) {
    return 'Il link logo deve essere un URL pubblico HTTPS.';
  }

  if (config.stripURL?.trim() && !isHttpsUrl(config.stripURL)) {
    return 'Il link immagine centrale deve essere un URL pubblico HTTPS.';
  }

  return null;
}

export function ImpostazioniPageClient({
  nomeAssociazione,
  sottotitoloAssociazione,
  logoGestionaleUrl = null,
  codiceFiscale,
  partitaIva,
  runtsNumero,
  runtsSezione,
  runtsDataIscrizione,
  indirizzo,
  cap,
  comune,
  provincia,
  email,
  pec,
  telefono,
  sitoWeb,
  iban,
  intestatarioConto,
  presidenteNome,
  testoRicevuta,
  ricevutaTestoIntro,
  ricevutaTestoAttestazione,
  ricevutaTestoNonCorrispettivo,
  ricevutaTestoNotaFinale,
  bolloAttivo,
  bolloImporto,
  walletConfig,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const logoGestionaleInputRef = useRef<HTMLInputElement | null>(null);

  const [currentLogoGestionaleUrl, setCurrentLogoGestionaleUrl] = useState<string | null>(
    logoGestionaleUrl
  );
  const [form, setForm] = useState({
    nomeAssociazione,
    sottotitoloAssociazione,
    logoGestionaleUrl: logoGestionaleUrl ?? '',
    codiceFiscale,
    partitaIva,
    runtsNumero,
    runtsSezione,
    runtsDataIscrizione,
    indirizzo,
    cap,
    comune,
    provincia,
    email,
    pec,
    telefono,
    sitoWeb,
    iban,
    intestatarioConto,
    presidenteNome,
    testoRicevuta,
    ricevutaTestoIntro,
    ricevutaTestoAttestazione,
    ricevutaTestoNonCorrispettivo,
    ricevutaTestoNotaFinale,
    bolloAttivo,
    bolloImporto: String(bolloImporto ?? 0),
  });
  const [walletVisualConfig, setWalletVisualConfig] = useState<WalletWalletVisualConfig>(
    normalizeWalletWalletConfig(walletConfig)
  );
  const [walletConfigError, setWalletConfigError] = useState<string | null>(null);
  const [walletColorInput, setWalletColorInput] = useState<string>(
    normalizeWalletWalletConfig(walletConfig).backgroundColor || '#1F2947'
  );
  const normalizedWalletConfig = normalizeWalletWalletConfig(walletVisualConfig);
  const walletPreviewPayload = buildProviderPassPayload(
    {
      id: 'demo-id',
      type: 'member',
      fullName: 'Andrea Loiudice',
      email: 'andrea@example.org',
      cardNumber: 'SOC-297730',
      roleLabel: 'Socio',
      qrValue: 'demo-id',
      expiryDate: '2026-12-31',
      associationName: 'Angeli dei Navigli ODV',
    },
    normalizedWalletConfig
  );

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    const nextForm = { ...form, [key]: value };
    setForm(nextForm);

    window.dispatchEvent(
      new CustomEvent('branding-preview-update', {
        detail: {
          nomeAssociazione: nextForm.nomeAssociazione,
          sottotitoloAssociazione: nextForm.sottotitoloAssociazione,
          logoUrl: currentLogoGestionaleUrl,
        },
      })
    );
  }

  function updateWalletConfig<K extends keyof WalletWalletVisualConfig>(
    key: K,
    value: WalletWalletVisualConfig[K]
  ) {
    setWalletConfigError(null);
    setWalletVisualConfig((current) => normalizeWalletWalletConfig({ ...current, [key]: value }));
  }

  function handleUploadLogoGestionale(file: File | null) {
    if (!file) {
      return;
    }

    startTransition(async () => {
      const result = await uploadLogoGestionaleAction({ file });

      if (!result.ok) {
        alert(result.error);
        return;
      }

      const freshUrl = `${result.data.publicUrl}?v=${new Date().getTime()}`;
      setCurrentLogoGestionaleUrl(freshUrl);
      updateField('logoGestionaleUrl', freshUrl);
    });
  }

  function updateWalletBackgroundColor(value: string) {
    const normalized = normalizeHexInput(value);
    setWalletConfigError(null);
    setWalletColorInput(normalized);

    if (HEX_COLOR_PATTERN.test(normalized)) {
      setWalletVisualConfig((current) =>
        normalizeWalletWalletConfig({
          ...current,
          backgroundColor: normalized,
        })
      );
    }
  }

  function handleSave() {
    const normalizedConfig = normalizeWalletWalletConfig(walletVisualConfig);
    const validationError = validateWalletConfig(normalizedConfig);

    if (validationError) {
      setWalletConfigError(validationError);
      return;
    }

    startTransition(async () => {
      const result = await salvaImpostazioniAction({
        nomeAssociazione: form.nomeAssociazione,
        sottotitoloAssociazione: form.sottotitoloAssociazione,
        logoGestionaleUrl: form.logoGestionaleUrl,
        codiceFiscale: form.codiceFiscale,
        partitaIva: form.partitaIva,
        runtsNumero: form.runtsNumero,
        runtsSezione: form.runtsSezione,
        runtsDataIscrizione: form.runtsDataIscrizione,
        indirizzo: form.indirizzo,
        cap: form.cap,
        comune: form.comune,
        provincia: form.provincia,
        email: form.email,
        pec: form.pec,
        telefono: form.telefono,
        sitoWeb: form.sitoWeb,
        iban: form.iban,
        intestatarioConto: form.intestatarioConto,
        presidenteNome: form.presidenteNome,
        testoRicevuta: form.testoRicevuta,
        ricevutaTestoIntro: form.ricevutaTestoIntro,
        ricevutaTestoAttestazione: form.ricevutaTestoAttestazione,
        ricevutaTestoNonCorrispettivo: form.ricevutaTestoNonCorrispettivo,
        ricevutaTestoNotaFinale: form.ricevutaTestoNotaFinale,
        bolloAttivo: form.bolloAttivo,
        bolloImporto: Number(form.bolloImporto || 0),
        walletConfig: normalizedConfig,
      });

      if (!result.ok) {
        alert(result.error);
        return;
      }

      setWalletConfigError(null);
      setWalletColorInput(normalizedConfig.backgroundColor || '#1F2947');
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader
        title="Impostazioni"
        subtitle="Personalizzazione grafica e dati dell'associazione"
        action={
          <button className="button" type="button" disabled={isPending} onClick={handleSave}>
            Salva impostazioni
          </button>
        }
      />

      <div style={{ display: 'grid', gap: 20 }}>
        <div className="card">
          <div className="eyebrow">Identità gestionale</div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              gap: 60,
              alignItems: 'start',
              marginTop: 12,
            }}
          >
            <div>
              <button
                type="button"
                className="upload-action-card"
                disabled={isPending}
                onClick={() => logoGestionaleInputRef.current?.click()}
                style={{
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  minHeight: 220,
                  width: '100%',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 14,
                  cursor: 'pointer',
                }}
              >
                {currentLogoGestionaleUrl ? (
                  <img
                    src={currentLogoGestionaleUrl}
                    alt="Logo gestionale"
                    style={{ width: 96, height: 96, objectFit: 'contain' }}
                  />
                ) : (
                  <ImageUp size={46} strokeWidth={2.1} />
                )}

                <div style={{ fontSize: 18, fontWeight: 800 }}>Logo gestionale</div>
                <div className="muted">Carica immagine</div>
              </button>

              <input
                ref={logoGestionaleInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                style={{ display: 'none' }}
                onChange={(e) => handleUploadLogoGestionale(e.target.files?.[0] ?? null)}
              />
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14, alignItems: 'center' }}>
                <div style={{ fontWeight: 700 }}>Nome gestionale</div>
                <input
                  className="input"
                  value={form.nomeAssociazione}
                  onChange={(e) => updateField('nomeAssociazione', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14, alignItems: 'center' }}>
                <div style={{ fontWeight: 700 }}>Sottotitolo</div>
                <input
                  className="input"
                  value={form.sottotitoloAssociazione}
                  onChange={(e) => updateField('sottotitoloAssociazione', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14, alignItems: 'center' }}>
                <div style={{ fontWeight: 700 }}>URL sito</div>
                <input
                  className="input"
                  placeholder="https://"
                  value={form.sitoWeb}
                  onChange={(e) => updateField('sitoWeb', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="eyebrow">WalletWallet</div>

            <div style={{ marginTop: 14, display: 'grid', gap: 18 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Titolo card
                  </label>
                  <input
                    className="input"
                    placeholder="Angeli dei Navigli ODV"
                    value={walletVisualConfig.logoText}
                    onChange={(e) => updateWalletConfig('logoText', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Colore card
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12 }}>
                    <input
                      className="input"
                      type="color"
                      value={walletVisualConfig.backgroundColor || '#1F2947'}
                      onChange={(e) => updateWalletBackgroundColor(e.target.value)}
                      style={{ padding: 6, minHeight: 48 }}
                    />
                    <input
                      className="input"
                      placeholder="#1f2947"
                      value={walletColorInput}
                      onChange={(e) => updateWalletBackgroundColor(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Link logo
                  </label>
                  <input
                    className="input"
                    type="url"
                    placeholder="https://..."
                    value={walletVisualConfig.logoURL ?? ''}
                    onChange={(e) => updateWalletConfig('logoURL', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Link immagine centrale
                  </label>
                  <input
                    className="input"
                    type="url"
                    placeholder="https://..."
                    value={walletVisualConfig.stripURL ?? ''}
                    onChange={(e) => updateWalletConfig('stripURL', e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#334155',
                  padding: 16,
                  display: 'grid',
                  gap: 6,
                }}
              >
                <div style={{ fontWeight: 800 }}>Usa URL pubblici HTTPS.</div>
                <div style={{ fontSize: 14 }}>
                  Logo e immagine centrale vengono inviati al provider solo se raggiungibili via HTTPS.
                </div>
              </div>

              {walletConfigError ? (
                <div
                  style={{
                    borderRadius: 14,
                    border: '1px solid #f59e0b',
                    background: '#fffbeb',
                    color: '#92400e',
                    padding: 16,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {walletConfigError}
                </div>
              ) : null}
            </div>
          </div>

          <div className="card">
            <div className="eyebrow">Anteprima Wallet</div>
            <div style={{ marginTop: 12 }}>
              <WalletWalletPassPreview
                logoText={walletPreviewPayload.logoText || normalizedWalletConfig.logoText}
                colorPreset={
                  walletPreviewPayload.colorPreset ||
                  mapHexToWalletWalletPreset(normalizedWalletConfig.backgroundColor || '#1f2947')
                }
                logoURL={walletPreviewPayload.logoURL}
                stripURL={walletPreviewPayload.stripURL}
                backgroundColor={walletPreviewPayload.backgroundColor}
                secondaryFields={walletPreviewPayload.secondaryFields ?? []}
                barcodeValue={walletPreviewPayload.barcodeValue}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="eyebrow">Dati fiscali e ricevute</div>

          <div style={{ marginTop: 12, display: 'grid', gap: 22 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Dati ente</div>

              <div className="form-grid">
                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Codice fiscale
                  </label>
                  <input
                    className="input"
                    value={form.codiceFiscale}
                    onChange={(e) => updateField('codiceFiscale', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Partita IVA
                  </label>
                  <input
                    className="input"
                    value={form.partitaIva}
                    onChange={(e) => updateField('partitaIva', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Numero RUNTS
                  </label>
                  <input
                    className="input"
                    value={form.runtsNumero}
                    onChange={(e) => updateField('runtsNumero', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Sezione RUNTS
                  </label>
                  <input
                    className="input"
                    value={form.runtsSezione}
                    onChange={(e) => updateField('runtsSezione', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Data iscrizione RUNTS
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={form.runtsDataIscrizione}
                    onChange={(e) => updateField('runtsDataIscrizione', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Presidente / firmatario
                  </label>
                  <input
                    className="input"
                    value={form.presidenteNome}
                    onChange={(e) => updateField('presidenteNome', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Sede e contatti</div>

              <div className="form-grid">
                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Indirizzo
                  </label>
                  <input
                    className="input"
                    value={form.indirizzo}
                    onChange={(e) => updateField('indirizzo', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    CAP
                  </label>
                  <input
                    className="input"
                    value={form.cap}
                    onChange={(e) => updateField('cap', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Comune
                  </label>
                  <input
                    className="input"
                    value={form.comune}
                    onChange={(e) => updateField('comune', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Provincia
                  </label>
                  <input
                    className="input"
                    value={form.provincia}
                    onChange={(e) => updateField('provincia', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    className="input"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    PEC
                  </label>
                  <input
                    className="input"
                    value={form.pec}
                    onChange={(e) => updateField('pec', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Telefono
                  </label>
                  <input
                    className="input"
                    value={form.telefono}
                    onChange={(e) => updateField('telefono', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Sito web
                  </label>
                  <input
                    className="input"
                    value={form.sitoWeb}
                    onChange={(e) => updateField('sitoWeb', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    IBAN
                  </label>
                  <input
                    className="input"
                    value={form.iban}
                    onChange={(e) => updateField('iban', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Intestatario conto
                  </label>
                  <input
                    className="input"
                    value={form.intestatarioConto}
                    onChange={(e) => updateField('intestatarioConto', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Testi ricevuta</div>

              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Testo introduttivo
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    style={{ resize: 'vertical', paddingTop: 12 }}
                    value={form.ricevutaTestoIntro}
                    onChange={(e) => updateField('ricevutaTestoIntro', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Testo attestazione
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    style={{ resize: 'vertical', paddingTop: 12 }}
                    value={form.ricevutaTestoAttestazione}
                    onChange={(e) => updateField('ricevutaTestoAttestazione', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Testo non corrispettivo
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    style={{ resize: 'vertical', paddingTop: 12 }}
                    value={form.ricevutaTestoNonCorrispettivo}
                    onChange={(e) => updateField('ricevutaTestoNonCorrispettivo', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Nota finale
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    style={{ resize: 'vertical', paddingTop: 12 }}
                    value={form.ricevutaTestoNotaFinale}
                    onChange={(e) => updateField('ricevutaTestoNotaFinale', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Testo ricevuta sintetico
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    style={{ resize: 'vertical', paddingTop: 12 }}
                    value={form.testoRicevuta}
                    onChange={(e) => updateField('testoRicevuta', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-grid">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 700,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.bolloAttivo}
                  onChange={(e) => updateField('bolloAttivo', e.target.checked)}
                />
                Applica bollo automatico
              </label>

              <div>
                <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                  Importo bollo
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.bolloImporto}
                  onChange={(e) => updateField('bolloImporto', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
