'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import {
  salvaImpostazioniAction,
  uploadLogoGestionaleAction,
  uploadTesseraAssetAction,
} from './actions';
import { ImageUp } from 'lucide-react';
import { TesseraPreviewCard } from '@/components/tessere/TesseraPreviewCard';

type Props = {
  logoUrl?: string | null;
  immagineCentraleUrl?: string | null;

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

  nomeAssociazioneTessera: string;
  coloreSfondoTessera: string;
  coloreTestoTessera: string;
};

export function ImpostazioniPageClient({
  logoUrl = null,
  immagineCentraleUrl = null,
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
  nomeAssociazioneTessera,
  coloreSfondoTessera,
  coloreTestoTessera,
}: Props) {

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(logoUrl);
  const [currentImmagineUrl, setCurrentImmagineUrl] = useState<string | null>(
    immagineCentraleUrl
  );

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
  nomeAssociazioneTessera,
  coloreSfondoTessera,
  coloreTestoTessera,
});

  const logoInputRef = useRef<HTMLInputElement | null>(null);
const immagineInputRef = useRef<HTMLInputElement | null>(null);
const logoGestionaleInputRef = useRef<HTMLInputElement | null>(null);

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

function handleUpload(tipo: 'logo' | 'immagine_centrale', file: File | null) {
  if (!file) return;

  startTransition(async () => {
    const result = await uploadTesseraAssetAction({ tipo, file });

    if (!result.ok) {
      alert(result.error);
      return;
    }

    if (tipo === 'logo') {
      setCurrentLogoUrl(result.data.publicUrl);
    } else {
      setCurrentImmagineUrl(result.data.publicUrl);
    }
  });
}

function handleSave() {
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
      nomeAssociazioneTessera: form.nomeAssociazioneTessera,
      coloreSfondoTessera: form.coloreSfondoTessera,
      coloreTestoTessera: form.coloreTestoTessera,
    });

    if (!result.ok) {
      alert(result.error);
      return;
    }

    router.refresh();
  });
}

function handleUploadLogoGestionale(file: File | null) {
  if (!file) return;

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
    style={{
      width: 96,
      height: 96,
      objectFit: 'contain',
    }}
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <div style={{ fontWeight: 700 }}>Nome gestionale</div>
        <input
          className="input"
          value={form.nomeAssociazione}
          onChange={(e) => updateField('nomeAssociazione', e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <div style={{ fontWeight: 700 }}>Sottotitolo</div>
        <input
          className="input"
          value={form.sottotitoloAssociazione}
          onChange={(e) => updateField('sottotitoloAssociazione', e.target.value)}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          gap: 14,
          alignItems: 'center',
        }}
      >
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
            <div className="eyebrow">Tessera digitale</div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 18,
                marginTop: 8,
              }}
            >
              <button
  type="button"
  className="upload-action-card"
  disabled={isPending}
  onClick={() => logoInputRef.current?.click()}
  style={{
    border: '1px solid #e5e7eb',
    background: '#fff',
    minHeight: 220,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    cursor: 'pointer',
  }}
>
  {currentLogoUrl ? (
    <img
      src={currentLogoUrl}
      alt="Logo tessera"
      style={{
        width: 96,
        height: 96,
        objectFit: 'contain',
      }}
    />
  ) : (
    <ImageUp size={46} strokeWidth={2.1} />
  )}

  <div style={{ fontSize: 18, fontWeight: 800 }}>Logo tessera</div>
  <div className="muted">Carica immagine</div>
</button>

              <button
  type="button"
  className="upload-action-card"
  disabled={isPending}
  onClick={() => immagineInputRef.current?.click()}
  style={{
    border: '1px solid #e5e7eb',
    background: '#fff',
    minHeight: 220,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    cursor: 'pointer',
  }}
>
  {currentImmagineUrl ? (
    <img
      src={currentImmagineUrl}
      alt="Immagine centrale"
      style={{
        width: 140,
        height: 90,
        objectFit: 'cover',
        borderRadius: 8,
      }}
    />
  ) : (
    <ImageUp size={46} strokeWidth={2.1} />
  )}

  <div style={{ fontSize: 18, fontWeight: 800 }}>Immagine centrale</div>
  <div className="muted">Carica immagine</div>
</button>

            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
              style={{ display: 'none' }}
              onChange={(e) => handleUpload('logo', e.target.files?.[0] ?? null)}
            />

            <input
              ref={immagineInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={(e) =>
                handleUpload('immagine_centrale', e.target.files?.[0] ?? null)
              }
            />

            <div className="form-grid" style={{ marginTop: 22 }}>
              <div>
                <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                  Nome associazione tessera
                </label>
                <input
                  className="input"
                  value={form.nomeAssociazioneTessera}
                  onChange={(e) => updateField('nomeAssociazioneTessera', e.target.value)}
                />
              </div>

              <div>
                <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                  Colore sfondo tessera
                </label>
                <input
                  className="input"
                  value={form.coloreSfondoTessera}
                  onChange={(e) => updateField('coloreSfondoTessera', e.target.value)}
                />
              </div>

              <div>
                <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
                  Colore testo tessera
                </label>
                <input
                  className="input"
                  value={form.coloreTestoTessera}
                  onChange={(e) => updateField('coloreTestoTessera', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 22, display: 'grid', gap: 18 }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Istruzioni logo</div>
                <div className="muted">
                  PNG trasparente consigliato. Formato quadrato. Dimensione consigliata: 300 ×
                  300 px.
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>
                  Istruzioni immagine centrale
                </div>
                <div className="muted">
                  Immagine orizzontale panoramica. Formato JPG o PNG. Dimensione consigliata:
                  1257 × 525 px.
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Formati supportati</div>
                <div className="muted">
                  Logo: PNG, JPG, WEBP, SVG. Immagine centrale: PNG, JPG, WEBP.
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="eyebrow">Anteprima tessera</div>

            <TesseraPreviewCard
              nome="Sonia"
              cognome="Mangione"
              codiceTessera="299392"
              annoValidita="2026"
              nomeAssociazione={form.nomeAssociazioneTessera}
              titoloTessera="Tessera 2026"
              coloreSfondo={form.coloreSfondoTessera}
              coloreTesto={form.coloreTestoTessera}
              coloreAccento="#cbbfa3"
              logoUrl={currentLogoUrl}
              immagineCentraleUrl={currentImmagineUrl}
              publicToken="preview-token-001"
            />
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
            Nota normativa finale
          </label>
          <textarea
            className="input"
            rows={3}
            style={{ resize: 'vertical', paddingTop: 12 }}
            value={form.ricevutaTestoNotaFinale}
            onChange={(e) => updateField('ricevutaTestoNotaFinale', e.target.value)}
          />
        </div>
      </div>
    </div>

    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Bollo e opzioni</div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 180px',
          gap: 16,
          alignItems: 'end',
        }}
      >
        <div>
          <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
            Imposta di bollo attiva
          </label>
          <select
            className="input"
            value={form.bolloAttivo ? 'si' : 'no'}
            onChange={(e) => updateField('bolloAttivo', e.target.value === 'si')}
          >
            <option value="si">Sì</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="muted" style={{ display: 'block', marginBottom: 6 }}>
            Importo bollo
          </label>
          <input
            className="input"
            value={form.bolloImporto}
            onChange={(e) => updateField('bolloImporto', e.target.value)}
          />
        </div>
      </div>
    </div>
  </div>
</div>
      </div>
    </>
  );
}