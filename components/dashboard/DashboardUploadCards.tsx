'use client';

import { useRef, type ChangeEvent, type CSSProperties } from 'react';
import { IdCard, Download, DatabaseBackup, FileSpreadsheet } from 'lucide-react';

const groupStyle: CSSProperties = {
  marginBottom: '24px',
};

const buttonsRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  gap: '24px',
  width: '100%',
};

const dualButtonWrapStyle: CSSProperties = {
  display: 'flex',
  gap: '24px',
  width: '100%',
};

const dualButtonItemStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const singleButtonWrapStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const textWrapStyle: CSSProperties = {
  marginTop: '14px',
  width: '100%',
};

const sideTextWrapStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
};

const textBlockStyle: CSSProperties = {
  margin: 0,
};

const buttonStyle: CSSProperties = {
  width: '100%',
  minHeight: '220px',
  padding: '24px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
};

const ripristinoButtonStyle: CSSProperties = {
  ...buttonStyle,
};

const textStyle: CSSProperties = {
  margin: 0,
  fontSize: '16px',
  lineHeight: 1.45,
};

const textSecondLineStyle: CSSProperties = {
  ...textStyle,
  marginTop: '8px',
};

export function DashboardUploadCards() {
  const sociInputRef = useRef<HTMLInputElement>(null);
  const volontariInputRef = useRef<HTMLInputElement>(null);
  const ripristinoInputRef = useRef<HTMLInputElement>(null);

  function handleOpenSociUpload() {
    sociInputRef.current?.click();
  }

  function handleOpenVolontariUpload() {
    volontariInputRef.current?.click();
  }

  function handleOpenRipristinoUpload() {
    ripristinoInputRef.current?.click();
  }

  function handleSociFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('CSV soci selezionato:', file.name);
    alert(`File CSV soci selezionato: ${file.name}`);
  }

  function handleVolontariFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('CSV volontari selezionato:', file.name);
    alert(`File CSV volontari selezionato: ${file.name}`);
  }

  function handleRipristinoFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File ripristino/migrazione selezionato:', file.name);
    alert(`File ripristino / migrazione selezionato: ${file.name}`);
  }

  return (
    <>
      <div>
        <div style={groupStyle}>
          <div style={dualButtonWrapStyle}>
            <div style={dualButtonItemStyle}>
              <a
                href="/templates/modello-import-soci.csv"
                download
                className="dashboard-feature-card dashboard-action-card dashboard-download-link"
                style={buttonStyle}
              >
                <FileSpreadsheet
                  size={36}
                  strokeWidth={1.6}
                  className="dashboard-feature-icon"
                />
                <h3>Modello CSV soci</h3>
                <p>Scarica il file modello</p>
                <Download
                  size={24}
                  strokeWidth={1.6}
                  className="dashboard-action-icon"
                />
              </a>
            </div>

            <div style={dualButtonItemStyle}>
              <button
                type="button"
                className="dashboard-feature-card dashboard-action-card"
                style={buttonStyle}
                onClick={handleOpenSociUpload}
              >
                <IdCard
                  size={36}
                  strokeWidth={1.6}
                  className="dashboard-feature-icon"
                />
                <h3>Importa libro soci</h3>
                <p>Importa file CSV</p>
                <Download
                  size={24}
                  strokeWidth={1.6}
                  className="dashboard-action-icon"
                />
              </button>
            </div>
          </div>

          <div style={textWrapStyle}>
            <p style={textStyle}>
              Scarica il file modello da usare come base per preparare i dati in
              modo corretto, prima di procedere con l’importazione del libro soci.
            </p>
          </div>
        </div>

        <div style={groupStyle}>
          <div style={dualButtonWrapStyle}>
            <div style={dualButtonItemStyle}>
              <a
                href="/templates/modello-import-volontari.csv"
                download
                className="dashboard-feature-card dashboard-action-card dashboard-download-link"
                style={buttonStyle}
              >
                <FileSpreadsheet
                  size={36}
                  strokeWidth={1.6}
                  className="dashboard-feature-icon"
                />
                <h3>Modello CSV volontari</h3>
                <p>Scarica il file modello</p>
                <Download
                  size={24}
                  strokeWidth={1.6}
                  className="dashboard-action-icon"
                />
              </a>
            </div>

            <div style={dualButtonItemStyle}>
              <button
                type="button"
                className="dashboard-feature-card dashboard-action-card"
                style={buttonStyle}
                onClick={handleOpenVolontariUpload}
              >
                <IdCard
                  size={36}
                  strokeWidth={1.6}
                  className="dashboard-feature-icon"
                />
                <h3>Importa registro volontari</h3>
                <p>Importa file CSV</p>
                <Download
                  size={24}
                  strokeWidth={1.6}
                  className="dashboard-action-icon"
                />
              </button>
            </div>
          </div>

          <div style={textWrapStyle}>
            <p style={textStyle}>
              Scarica il file modello da usare come base per preparare i dati in
              modo corretto, prima di procedere con l’importazione del registro
              volontari.
            </p>
          </div>
        </div>

                <div style={{ ...buttonsRowStyle, marginBottom: 0 }}>
          <div style={singleButtonWrapStyle}>
            <a
              href="/strumenti/ripristino-migrazione"
              className="dashboard-feature-card dashboard-action-card dashboard-download-link"
              style={ripristinoButtonStyle}
            >
              <DatabaseBackup
                size={36}
                strokeWidth={1.6}
                className="dashboard-feature-icon"
              />
              <h3>Ripristino / migrazione dati</h3>
              <p>Operazione tecnica</p>
              <Download
                size={24}
                strokeWidth={1.6}
                className="dashboard-action-icon"
              />
            </a>
          </div>

          <div style={sideTextWrapStyle}>
            <div style={textBlockStyle}>
              <p style={textStyle}>
                Accedi alle operazioni straordinarie di recupero, ripristino o
                trasferimento archivio.
              </p>
              <p style={textSecondLineStyle}>
                Questa funzione è riservata alle procedure tecniche e
                amministrative.
              </p>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={sociInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleSociFileChange}
      />

      <input
        ref={volontariInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleVolontariFileChange}
      />

      <input
        ref={ripristinoInputRef}
        type="file"
        accept=".csv,text/csv,.zip,application/zip"
        style={{ display: 'none' }}
        onChange={handleRipristinoFileChange}
      />
    </>
  );
}