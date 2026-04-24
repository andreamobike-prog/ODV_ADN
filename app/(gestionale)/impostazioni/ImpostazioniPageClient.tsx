'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUp, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { WalletWalletPassPreview } from '@/components/wallet/WalletWalletPassPreview';
import { buildProviderPassPayload } from '@/lib/wallet/provider/buildProviderPassPayload';
import { WALLETWALLET_PREVIEW_COLOR_PRESETS } from '@/lib/wallet/provider/getWalletWalletPreviewTheme';
import { resolveWalletWalletAssets } from '@/lib/wallet/provider/resolveWalletWalletAssets';
import {
  salvaImpostazioniAction,
  uploadLogoGestionaleAction,
} from './actions';
import {
  WALLETWALLET_FIELD_LIMITS,
  type WalletField,
  type WalletWalletVisualConfig,
} from '@/lib/wallet/provider/types';
import { normalizeWalletWalletConfig } from '@/lib/wallet/provider/normalizeWalletWalletConfig';

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

type WalletFieldSection = keyof Pick<
  WalletWalletVisualConfig,
  'headerFields' | 'primaryFields' | 'secondaryFields' | 'backFields'
>;

const COLOR_PRESET_OPTIONS = WALLETWALLET_PREVIEW_COLOR_PRESETS;

const FIELD_SECTION_LABELS: Record<WalletFieldSection, string> = {
  headerFields: 'Header fields',
  primaryFields: 'Primary fields (max 1)',
  secondaryFields: 'Secondary fields',
  backFields: 'Back fields',
};

const PLACEHOLDER_HINTS = [
  '{{fullName}}',
  '{{fullNameUpper}}',
  '{{cardNumber}}',
  '{{roleLabel}}',
  '{{email}}',
  '{{id}}',
  '{{expiryDate}}',
  '{{associationName}}',
];

function cloneFieldList(fields: WalletField[]) {
  return fields.map((field) => ({ ...field }));
}

function validateWalletConfig(config: WalletWalletVisualConfig) {
  const sections: WalletFieldSection[] = [
    'headerFields',
    'primaryFields',
    'secondaryFields',
    'backFields',
  ];

  if (!config.logoText.trim()) {
    return 'Il logo text non puo essere vuoto.';
  }

  for (const section of sections) {
    const limit = WALLETWALLET_FIELD_LIMITS[section];

    if (config[section].length > limit) {
      return `${FIELD_SECTION_LABELS[section]} supera il limite consentito.`;
    }

    for (const field of config[section]) {
      if (!field.label.trim() || !field.value.trim()) {
        return `Compila label e value in ${FIELD_SECTION_LABELS[section]}.`;
      }
    }
  }

  return null;
}

function WalletFieldsEditor({
  title,
  description,
  fields,
  limit,
  warning,
  onAdd,
  onRemove,
  onChange,
}: {
  title: string;
  description?: string;
  fields: WalletField[];
  limit: number;
  warning?: string | null;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, key: keyof WalletField, value: string) => void;
}) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
          <div className="muted">
            {fields.length}/{limit} righe configurate
          </div>
          {description ? <div className="muted" style={{ marginTop: 4 }}>{description}</div> : null}
        </div>
        <button className="button secondary" type="button" onClick={onAdd} disabled={fields.length >= limit}>
          <Plus size={16} />
          Aggiungi riga
        </button>
      </div>

      {warning ? (
        <div
          style={{
            borderRadius: 12,
            border: '1px solid #f59e0b',
            background: '#fffbeb',
            color: '#92400e',
            padding: '10px 12px',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {warning}
        </div>
      ) : null}

      {fields.length > 0 ? (
        fields.map((field, index) => (
          <div
            key={`${title}-${index}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.4fr auto',
              gap: 12,
              alignItems: 'end',
              padding: 14,
              border: '1px solid #e5e7eb',
              borderRadius: 14,
              background: '#fff',
            }}
          >
            <div>
              <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                Label
              </label>
              <input
                className="input"
                value={field.label}
                onChange={(e) => onChange(index, 'label', e.target.value)}
              />
            </div>

            <div>
              <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                Value
              </label>
              <input
                className="input"
                value={field.value}
                onChange={(e) => onChange(index, 'value', e.target.value)}
              />
            </div>

            <button className="button secondary" type="button" onClick={() => onRemove(index)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))
      ) : (
        <div
          style={{
            border: '1px dashed #cbd5e1',
            borderRadius: 14,
            padding: 16,
            background: '#fff',
            color: '#64748b',
          }}
        >
          Nessun campo configurato.
        </div>
      )}
    </div>
  );
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
  const [walletConfigNotice, setWalletConfigNotice] = useState<{
    section: WalletFieldSection;
    message: string;
  } | null>(null);
  const normalizedWalletConfig = normalizeWalletWalletConfig(walletVisualConfig);
  const walletResolvedAssets = resolveWalletWalletAssets(normalizedWalletConfig);
  const stripLayoutActive = Boolean(
    normalizedWalletConfig.stripURL?.trim() || walletResolvedAssets.stripURL
  );
  const walletPreviewPayload = buildProviderPassPayload(
    {
      id: 'demo-id',
      type: 'member',
      fullName: 'Sonia Mangione',
      email: 'sonia@example.org',
      cardNumber: 'SOC-2026-001',
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
    setWalletConfigNotice(null);
    setWalletVisualConfig((current) => {
      const nextConfig = { ...current, [key]: value };

      if (key === 'stripURL') {
        return normalizeWalletWalletConfig(nextConfig);
      }

      return nextConfig;
    });
  }

  function updateWalletField(
    section: WalletFieldSection,
    index: number,
    key: keyof WalletField,
    value: string
  ) {
    setWalletConfigNotice(null);
    setWalletVisualConfig((current) => {
      const nextFields = cloneFieldList(current[section]);
      nextFields[index] = { ...nextFields[index], [key]: value };
      return { ...current, [section]: nextFields };
    });
  }

  function addWalletField(section: WalletFieldSection) {
    if (walletVisualConfig[section].length >= WALLETWALLET_FIELD_LIMITS[section]) {
      setWalletConfigNotice({
        section,
        message:
          section === 'primaryFields'
            ? 'WalletWallet supporta un solo primary field. Usa i secondary fields per nome, codice e altri dati.'
            : `${FIELD_SECTION_LABELS[section]} ha gia raggiunto il limite supportato dal provider.`,
      });
      return;
    }

    setWalletConfigNotice(null);
    setWalletVisualConfig((current) => {
      return {
        ...current,
        [section]: [...current[section], { label: '', value: '' }],
      };
    });
  }

  function removeWalletField(section: WalletFieldSection, index: number) {
    setWalletConfigNotice(null);
    setWalletVisualConfig((current) => ({
      ...current,
      [section]: current[section].filter((_, fieldIndex) => fieldIndex !== index),
    }));
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

  function handleSave() {
    const normalizedConfig = normalizeWalletWalletConfig(walletVisualConfig);
    const validationError = validateWalletConfig(normalizedConfig);

    if (validationError) {
      alert(validationError);
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
              <div className="form-grid">
                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Logo text
                  </label>
                  <input
                    className="input"
                    value={walletVisualConfig.logoText}
                    onChange={(e) => updateWalletConfig('logoText', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Color preset
                  </label>
                  <select
                    className="input"
                    value={walletVisualConfig.colorPreset}
                    onChange={(e) => updateWalletConfig('colorPreset', e.target.value)}
                  >
                    {COLOR_PRESET_OPTIONS.map((preset) => (
                      <option key={preset} value={preset}>
                        {preset}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Logo URL o path pubblico
                  </label>
                  <input
                    className="input"
                    placeholder="/logo.png oppure https://..."
                    value={walletVisualConfig.logoURL ?? ''}
                    onChange={(e) => updateWalletConfig('logoURL', e.target.value)}
                  />
                </div>

                <div>
                  <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                    Strip URL o path pubblico
                  </label>
                  <input
                    className="input"
                    placeholder="https://... oppure asset tessera"
                    value={walletVisualConfig.stripURL ?? ''}
                    onChange={(e) => updateWalletConfig('stripURL', e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  border: '1px solid #f59e0b',
                  background: '#fffbeb',
                  color: '#92400e',
                  padding: 16,
                  display: 'grid',
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 800 }}>
                  Le immagini del pass reale funzionano solo con URL pubblici HTTPS e piano WalletWallet che supporta logoURL/stripURL.
                </div>
                <div style={{ fontSize: 14 }}>
                  Fallback logo: <code>/logo.png</code>. Per la strip usa un asset pubblico HTTPS oppure l&apos;immagine centrale salvata nelle impostazioni tessera.
                </div>
              </div>

              {stripLayoutActive ? (
                <div
                  style={{
                    borderRadius: 14,
                    border: '1px solid #0ea5e9',
                    background: '#f0f9ff',
                    color: '#0f172a',
                    padding: 16,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Con immagine centrale attiva, i Primary fields vengono disattivati per evitare sovrapposizioni nel pass reale.
                </div>
              ) : null}

              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 14,
                  padding: 16,
                  background: '#fff',
                  display: 'grid',
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 800 }}>Placeholder supportati</div>
                <div className="muted">
                  Usa questi token nei value per comporre i campi dinamici del pass.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PLACEHOLDER_HINTS.map((placeholder) => (
                    <code
                      key={placeholder}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 999,
                        background: '#f1f5f9',
                        fontSize: 12,
                      }}
                    >
                      {placeholder}
                    </code>
                  ))}
                </div>
              </div>

              <WalletFieldsEditor
                title="Header fields (max 2)"
                description="Area alta del fronte. WalletWallet rende al massimo due header fields."
                fields={walletVisualConfig.headerFields}
                limit={WALLETWALLET_FIELD_LIMITS.headerFields}
                warning={
                  walletConfigNotice?.section === 'headerFields' ? walletConfigNotice.message : null
                }
                onAdd={() => addWalletField('headerFields')}
                onRemove={(index) => removeWalletField('headerFields', index)}
                onChange={(index, key, value) => updateWalletField('headerFields', index, key, value)}
              />

              {!stripLayoutActive ? (
                <WalletFieldsEditor
                  title="Primary fields (max 1)"
                  description="Usane al massimo uno solo quando non stai usando la strip image centrale."
                  fields={walletVisualConfig.primaryFields}
                  limit={WALLETWALLET_FIELD_LIMITS.primaryFields}
                  warning={
                    walletConfigNotice?.section === 'primaryFields'
                      ? walletConfigNotice.message
                      : null
                  }
                  onAdd={() => addWalletField('primaryFields')}
                  onRemove={(index) => removeWalletField('primaryFields', index)}
                  onChange={(index, key, value) =>
                    updateWalletField('primaryFields', index, key, value)
                  }
                />
              ) : null}

              <WalletFieldsEditor
                title="Secondary fields"
                description="Griglia principale sotto l'immagine da usare per nome, codice tessera, scadenza e altri dati frontali."
                fields={normalizedWalletConfig.secondaryFields}
                limit={WALLETWALLET_FIELD_LIMITS.secondaryFields}
                warning={
                  walletConfigNotice?.section === 'secondaryFields'
                    ? walletConfigNotice.message
                    : null
                }
                onAdd={() => addWalletField('secondaryFields')}
                onRemove={(index) => removeWalletField('secondaryFields', index)}
                onChange={(index, key, value) => updateWalletField('secondaryFields', index, key, value)}
              />

              <WalletFieldsEditor
                title="Back fields"
                description="Mostrati solo sul retro della tessera."
                fields={walletVisualConfig.backFields}
                limit={WALLETWALLET_FIELD_LIMITS.backFields}
                warning={
                  walletConfigNotice?.section === 'backFields' ? walletConfigNotice.message : null
                }
                onAdd={() => addWalletField('backFields')}
                onRemove={(index) => removeWalletField('backFields', index)}
                onChange={(index, key, value) => updateWalletField('backFields', index, key, value)}
              />
            </div>
          </div>

          <div className="card">
            <div className="eyebrow">Anteprima Wallet</div>
            <div className="muted" style={{ marginTop: 8 }}>
              Anteprima simulata del layout reale supportato dal provider WalletWallet con header, strip centrale pulita, dati sotto immagine e QR in basso.
            </div>
            <div style={{ marginTop: 12 }}>
              <WalletWalletPassPreview
                logoText={walletPreviewPayload.logoText || normalizedWalletConfig.logoText}
                colorPreset={walletPreviewPayload.colorPreset || normalizedWalletConfig.colorPreset}
                logoURL={walletPreviewPayload.logoURL}
                stripURL={walletPreviewPayload.stripURL}
                backgroundColor={walletPreviewPayload.backgroundColor}
                headerFields={walletPreviewPayload.headerFields ?? []}
                secondaryFields={walletPreviewPayload.secondaryFields ?? []}
                backFields={walletPreviewPayload.backFields ?? []}
                barcodeValue={walletPreviewPayload.barcodeValue}
                assetWarnings={walletResolvedAssets.warnings}
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
