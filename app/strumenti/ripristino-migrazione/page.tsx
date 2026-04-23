'use client';

import Link from 'next/link';
import { useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import { Download } from 'lucide-react';
import { Modal } from '@/components/dashboard/Modal';

export default function RipristinoMigrazionePage() {
    const backupInputRef = useRef<HTMLInputElement>(null);
    const [backupFileName, setBackupFileName] = useState('');

    const migrazioneInputRef = useRef<HTMLInputElement>(null);
    const [migrazioneFileName, setMigrazioneFileName] = useState('');
    const [showEsitoAnalisiModal, setShowEsitoAnalisiModal] = useState(false);
    const [analisiOk, setAnalisiOk] = useState(true);
    const [migrazioneAvviata, setMigrazioneAvviata] = useState(false);
    const [showBarraMigrazione, setShowBarraMigrazione] = useState(false);
    const [showReimportazioneBox, setShowReimportazioneBox] = useState(false);
    const [showConfermaReimportazioneModal, setShowConfermaReimportazioneModal] = useState(false);
    const [reimportazioneAvviata, setReimportazioneAvviata] = useState(false);
    const [showEsitoAnalisiReimportazioneModal, setShowEsitoAnalisiReimportazioneModal] = useState(false);
    const [showBarraReimportazione, setShowBarraReimportazione] = useState(false);
    const reimportazioneInputRef = useRef<HTMLInputElement>(null);
    const [reimportazioneFileName, setReimportazioneFileName] = useState('');

    function handleApriReimportazione() {
    setShowReimportazioneBox(true);
    setReimportazioneAvviata(false);
    setReimportazioneFileName('');
}

    function handleOpenReimportazioneUpload() {
        reimportazioneInputRef.current?.click();
    }

    function handleReimportazioneFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setReimportazioneFileName(file.name);
    setShowConfermaReimportazioneModal(true);
}

    function handleAvviaAnalisiMigrazione() {
        setAnalisiOk(true);
        setShowEsitoAnalisiModal(true);
    }

    const [showProceduraStraordinaria, setShowProceduraStraordinaria] =
        useState(false);

    function handleToggleProceduraStraordinaria() {
        setShowProceduraStraordinaria((prev) => !prev);
    }

    function handleOpenMigrazioneUpload() {
        migrazioneInputRef.current?.click();
    }

    function handleMigrazioneFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setMigrazioneFileName(file.name);
        setShowEsitoAnalisiModal(false);
        setMigrazioneAvviata(false);
        setShowBarraMigrazione(false);
        console.log('File migrazione selezionato:', file.name);
    }

    function handleOpenBackupUpload() {
        backupInputRef.current?.click();
    }

    function handleBackupFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setBackupFileName(file.name);
        console.log('File backup selezionato:', file.name);
    }

    return (
        <main style={mainStyle}>
            <div style={containerStyle}>
                <section style={heroSectionStyle}>
                    <Link
                        href="/"
                        aria-label="Chiudi"
                        className="button secondary"
                        style={closeButtonStyle}
                    >
                        ✕
                    </Link>

                    <div style={{ maxWidth: 860 }}>
                        <h1 style={heroTitleStyle}>Ripristino / migrazione dati</h1>

                        <p style={heroTextStyle}>
                            Area tecnica riservata alle operazioni straordinarie di recupero,
                            ripristino e trasferimento dati. Queste funzioni devono essere
                            utilizzate solo da utenti autorizzati.
                        </p>
                    </div>
                </section>

                <section style={blockStyle}>
                    <h2 style={blockTitleStyle}>Ripristina da backup</h2>

                    <div style={blockTextWrapStyle}>
                        <p style={blockTextStyle}>
                            Usa questa funzione per ripristinare dati da un backup precedente
                            del gestionale.
                        </p>

                        <p style={blockTextStyle}>
                            L’operazione è riservata agli amministratori e deve essere usata
                            solo quando è necessario recuperare un archivio già salvato.
                        </p>
                    </div>

                    <div style={buttonRowStyle}>
                        <button
    type="button"
    className="dashboard-action-card ripristino-action-button"
    style={actionCardButtonStyle}
    onClick={handleOpenMigrazioneUpload}
>
    <span>Carica file di migrazione</span>
    <Download
        size={28}
        strokeWidth={1.8}
        style={{ marginLeft: '10px', flexShrink: 0 }}
    />
</button>

                        <input
                            ref={reimportazioneInputRef}
                            type="file"
                            accept=".zip,.json,.csv,application/zip,application/json,text/csv"
                            style={{ display: 'none' }}
                            onChange={handleReimportazioneFileChange}
                        />

                        {reimportazioneFileName ? (
                            <p style={selectedFileTextStyle}>
                                File selezionato: {reimportazioneFileName}
                            </p>
                        ) : null}

                    </div>

                    <input
                        ref={backupInputRef}
                        type="file"
                        accept=".zip,.json,.csv,application/zip,application/json,text/csv"
                        style={{ display: 'none' }}
                        onChange={handleBackupFileChange}
                    />

                    {backupFileName ? (
                        <p style={selectedFileTextStyle}>
                            File selezionato: {backupFileName}
                        </p>
                    ) : null}
                </section>

                <section style={blockStyle}>
                    <h2 style={blockTitleStyle}>Migra da altro gestionale</h2>

                    <div style={blockTextWrapStyle}>
                        <p style={blockTextStyle}>
                            Usa questa funzione per importare archivi provenienti da altri
                            gestionali, secondo i tracciati compatibili previsti dal sistema.
                        </p>

                        <p style={blockTextStyle}>
                            Questa procedura serve per trasferimenti iniziali, cambi di
                            piattaforma o recupero dati da sistemi esterni.
                        </p>
                    </div>

                    <div style={buttonRowStyle}>
                        <button
                            type="button"
                            className="dashboard-action-card ripristino-action-button"
                            style={actionCardButtonStyle}
                            onClick={handleOpenMigrazioneUpload}
                        >
                            <span>Carica file di migrazione</span>
                            <Download
                                size={28}
                                strokeWidth={1.8}
                                style={{ marginLeft: '10px', flexShrink: 0 }}
                            />
                        </button>
                    </div>

                    <input
                        ref={migrazioneInputRef}
                        type="file"
                        accept=".csv,.zip,.json,text/csv,application/zip,application/json"
                        style={{ display: 'none' }}
                        onChange={handleMigrazioneFileChange}
                    />

                    {migrazioneFileName ? (
                        <div style={migrazioneBoxStyle}>
                            <p style={migrazioneBoxTitleStyle}>File selezionato</p>

                            <p style={migrazioneBoxTextStyle}>{migrazioneFileName}</p>

                            <p style={migrazioneBoxTextStyle}>
                                <strong>Attenzione:</strong> Prima di procedere, verifica che il file sia
                                stato compilato correttamente usando il modello CSV del gestionale e che
                                non contenga dati di prova o righe non volute.
                            </p>

                            <div style={migrazioneBoxActionRowStyle}>
                                <button
                                    type="button"
                                    className="dashboard-action-card ripristino-action-button"
                                    style={procediButtonStyle}
                                    onClick={handleAvviaAnalisiMigrazione}
                                >
                                    <span>Procedi</span>
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {showBarraMigrazione ? (
                        <div style={barraWrapStyle}>
                            <div style={barraTrackStyle}>
                                <div style={barraFillStyle} />
                            </div>
                            <p style={barraTextStyle}>Avvio migrazione in corso...</p>
                        </div>
                    ) : migrazioneAvviata ? (
                        <div style={migrazioneAvviataWrapStyle}>
                            <div style={migrazioneCheckCircleStyle}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="26"
                                    height="26"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </div>

                            <div style={migrazioneAvviataLabelStyle}>Migrazione avviata</div>
                        </div>
                    ) : null}

                </section>

                <section style={blockStyle}>
                    <h2 style={blockTitleStyle}>Reimportazione straordinaria</h2>

                    <div style={blockTextWrapStyle}>
                        <p style={blockTextStyle}>
                            Questa funzione consente operazioni straordinarie di riallineamento
                            o recupero dati.
                        </p>

                        <p style={blockTextStyle}>
                            Può incidere anche su record consolidati e deve essere usata solo
                            in casi tecnici motivati.
                        </p>
                    </div>

                    <div style={buttonRowStyle}>
                        <button
    type="button"
    className="dashboard-action-card ripristino-action-button"
    style={actionCardButtonStyle}
    onClick={handleToggleProceduraStraordinaria}
>
    <span>Apri procedura straordinaria</span>
</button>
                    </div>

                    {showProceduraStraordinaria ? (
                        <div style={proceduraBoxStyle}>
                            <p style={proceduraIntroStyle}>
                                Seleziona il tipo di operazione straordinaria da eseguire.
                            </p>

                            <div style={proceduraListStyle}>
                                <div>
                                    <button
                                        type="button"
                                        style={proceduraItemStyle}
                                        onClick={() => setShowReimportazioneBox((prev) => !prev)}
                                    >
                                        Reimportazione straordinaria archivio
                                    </button>

                                    {showReimportazioneBox ? (
    <div style={migrazioneBoxStyle}>
        <p style={migrazioneBoxTitleStyle}>File di reimportazione</p>

        <p style={migrazioneBoxTextStyle}>
            Carica un file tecnico di backup o ripristino da usare per la
            reimportazione straordinaria dell’archivio.
        </p>

        <div style={migrazioneBoxActionRowStyle}>
           <button
    type="button"
    className="dashboard-action-card ripristino-action-button"
    style={actionCardButtonStyle}
    onClick={handleOpenReimportazioneUpload}
>
    <span>Carica file di backup</span>
    <Download
        size={28}
        strokeWidth={1.8}
        style={{ marginLeft: '10px', flexShrink: 0 }}
    />
</button>
        </div>

        <input
            ref={reimportazioneInputRef}
            type="file"
            accept=".zip,.json,.csv,application/zip,application/json,text/csv"
            style={{ display: 'none' }}
            onChange={handleReimportazioneFileChange}
        />

        {reimportazioneFileName ? (
    <p style={selectedFileTextStyle}>
        File selezionato: {reimportazioneFileName}
    </p>
) : null}

{showBarraReimportazione ? (
    <div style={barraWrapStyle}>
        <div style={barraTrackStyle}>
            <div style={barraFillStyle} />
        </div>
        <p style={barraTextStyle}>Reimportazione in corso...</p>
    </div>
) : reimportazioneAvviata ? (
    <div style={migrazioneAvviataWrapStyle}>
        <div style={migrazioneCheckCircleStyle}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M20 6 9 17l-5-5" />
            </svg>
        </div>

        <div style={migrazioneAvviataLabelStyle}>
            Reimportazione straordinaria avviata
        </div>
    </div>
) : null}

    </div>
) : null}
                                </div>

                                <button type="button" style={proceduraItemStyle}>
                                    Riallineamento dati consolidati
                                </button>

                                <button type="button" style={proceduraItemStyle}>
                                    Recupero dati da file tecnico
                                </button>

                                <button type="button" style={proceduraItemStyle}>
                                    Visualizza storico operazioni
                                </button>
                            </div>

                        </div>
                    ) : null}

                    {reimportazioneAvviata ? (
                        <div style={migrazioneAvviataWrapStyle}>
                            <div style={migrazioneCheckCircleStyle}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="26"
                                    height="26"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </div>

                            <div style={migrazioneAvviataLabelStyle}>
                                Reimportazione straordinaria avviata
                            </div>
                        </div>
                    ) : null}

                </section>
            </div>

            <Modal
                open={showEsitoAnalisiModal}
                title="Risultato analisi"
                onClose={() => setShowEsitoAnalisiModal(false)}
            >
                <div style={{ display: 'grid', gap: 12 }}>
                    {analisiOk ? (
                        <>
                            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: '#374151' }}>
                                L'analisi è andata a buon fine.
                            </p>

                            <p style={modalEsitoTextStyle}>
                                File letto correttamente: <strong>Sì</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Intestazioni riconosciute: <strong>Sì</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Record trovati: <strong>128</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Record importabili: <strong>119</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Record con anomalie: <strong>9</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Record già esistenti da verificare: <strong>14</strong>
                            </p>
                        </>
                    ) : (
                        <>
                            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: '#374151' }}>
                                L'analisi non è andata a buon fine.
                            </p>

                            <p style={modalEsitoTextStyle}>
                                File letto correttamente: <strong>segnala eventuale errore</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Intestazioni riconosciute: <strong>segnala eventuale errore</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Record trovati: <strong>segnala eventuale errore</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Record importabili: <strong>segnala eventuale errore</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Record con anomalie: <strong>segnala eventuale errore</strong>
                            </p>

                            <p style={modalEsitoTextStyle}>
                                Record già esistenti da verificare: <strong>segnala eventuale errore</strong>
                            </p>
                        </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                        <button
                            type="button"
                            className="button secondary"
                            onClick={() => setShowEsitoAnalisiModal(false)}
                        >
                            Annulla
                        </button>

                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                setShowEsitoAnalisiModal(false);
                                setShowBarraMigrazione(true);
                                setMigrazioneAvviata(false);

                                window.setTimeout(() => {
                                    setShowBarraMigrazione(false);
                                    setMigrazioneAvviata(true);
                                }, 2200);
                            }}
                        >
                            Procedi
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={showConfermaReimportazioneModal}
                title="Attenzione"
                onClose={() => setShowConfermaReimportazioneModal(false)}
            >
                <div style={{ display: 'grid', gap: 16 }}>
                    <p style={modalEsitoTextStyle}>
                        ⚠️ Usare solo in casi tecnici eccezionali. Questa procedura può
                        sovrascrivere dati consolidati e invalidare l’autenticità del Registro volontari.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button
    type="button"
    className="button"
    onClick={() => {
        setShowConfermaReimportazioneModal(false);
        setShowEsitoAnalisiReimportazioneModal(true);
        setShowBarraReimportazione(false);
        setReimportazioneAvviata(false);
    }}
>
    Conferma
</button>
                    </div>
                </div>
            </Modal>

<Modal
    open={showEsitoAnalisiReimportazioneModal}
    title="Risultato analisi"
    onClose={() => setShowEsitoAnalisiReimportazioneModal(false)}
>
    <div style={{ display: 'grid', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: '#374151' }}>
            L'analisi è andata a buon fine.
        </p>

        <p style={modalEsitoTextStyle}>
            File letto correttamente: <strong>Sì</strong>
        </p>

        <p style={modalEsitoTextStyle}>
            Intestazioni riconosciute: <strong>Sì</strong>
        </p>

        <p style={modalEsitoTextStyle}>
            Record trovati: <strong>128</strong>
        </p>

        <p style={modalEsitoTextStyle}>
            Record importabili: <strong>119</strong>
        </p>

        <p style={modalEsitoTextStyle}>
            Record con anomalie: <strong>9</strong>
        </p>

        <p style={modalEsitoTextStyle}>
            Record già esistenti da verificare: <strong>14</strong>
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
                type="button"
                className="button secondary"
                onClick={() => setShowEsitoAnalisiReimportazioneModal(false)}
            >
                Annulla
            </button>

            <button
    type="button"
    className="button"
    onClick={() => {
        setShowEsitoAnalisiReimportazioneModal(false);
        setShowBarraReimportazione(true);
        setReimportazioneAvviata(false);

        window.setTimeout(() => {
            setShowBarraReimportazione(false);
            setReimportazioneAvviata(true);
        }, 2200);
    }}
>
    Procedi
</button>
        </div>
    </div>
</Modal>

        </main>
    );
}

const mainStyle: CSSProperties = {
    minHeight: '100vh',
    background: '#f7f7f5',
    padding: '48px 20px',
    fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#1f2937',
};

const containerStyle: CSSProperties = {
    maxWidth: 980,
    margin: '0 auto',
};

const heroSectionStyle: CSSProperties = {
    position: 'relative',
    background: '#ffffff',
    borderRadius: 0,
    padding: '32px 28px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    marginBottom: 24,
};

const heroTitleStyle: CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
    lineHeight: 1.1,
    fontWeight: 800,
    color: '#111827',
};

const heroTextStyle: CSSProperties = {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.7,
    color: '#374151',
};

const blockStyle: CSSProperties = {
    background: '#ffffff',
    borderRadius: 0,
    padding: '32px 28px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    marginBottom: 24,
};

const blockTitleStyle: CSSProperties = {
    marginTop: 0,
    marginBottom: 24,
    fontSize: 28,
    color: '#111827',
};

const blockTextWrapStyle: CSSProperties = {
    display: 'grid',
    gap: 14,
};

const blockTextStyle: CSSProperties = {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.7,
    color: '#374151',
};

const buttonRowStyle: CSSProperties = {
    marginTop: 22,
};

const actionCardButtonStyle: CSSProperties = {
    minWidth: 280,
    minHeight: 64,
    padding: '0 20px',
    border: '1px solid #d8dbe2',
    background: '#ffffff',
    color: '#111827',
    fontSize: 20,
    lineHeight: 1,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 14,
    boxSizing: 'border-box',
};

const selectedFileTextStyle: CSSProperties = {
    marginTop: 14,
    marginBottom: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: '#667085',
};

const proceduraBoxStyle: CSSProperties = {
    marginTop: 18,
    padding: '20px 22px',
    border: '1px solid #d9cfe6',
    background: '#f3edf8',
};

const proceduraIntroStyle: CSSProperties = {
    margin: '0 0 14px 0',
    fontSize: 15,
    lineHeight: 1.6,
    color: '#374151',
};

const proceduraListStyle: CSSProperties = {
    display: 'grid',
    gap: 12,
};

const proceduraItemStyle: CSSProperties = {
    minHeight: 48,
    padding: '0 16px',
    border: '1px solid #d8dbe2',
    background: '#ffffff',
    color: '#111827',
    fontSize: 15,
    fontWeight: 600,
    textAlign: 'left',
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

const migrazioneBoxStyle: CSSProperties = {
    marginTop: 18,
    padding: '20px 22px',
    border: '1px solid #d9cfe6',
    background: '#f3edf8',
    maxWidth: 760,
};

const migrazioneBoxTitleStyle: CSSProperties = {
    margin: '0 0 10px 0',
    fontSize: 15,
    lineHeight: 1.4,
    fontWeight: 700,
    color: '#5b4b78',
};

const migrazioneBoxTextStyle: CSSProperties = {
    margin: '0 0 10px 0',
    fontSize: 14,
    lineHeight: 1.6,
    color: '#5b4b78',
};

const migrazioneBoxActionRowStyle: CSSProperties = {
    marginTop: 16,
};

const modalEsitoTextStyle: CSSProperties = {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.6,
    color: '#374151',
};

const procediButtonStyle: CSSProperties = {
    minWidth: 180,
    minHeight: 56,
    padding: '0 18px',
    border: '1px solid #d8dbe2',
    background: '#ffffff',
    color: '#111827',
    fontSize: 16,
    lineHeight: 1,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
};
const migrazioneAvviataTextStyle: CSSProperties = {
    marginTop: 14,
    marginBottom: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: '#5b4b78',
    fontWeight: 600,
};
const barraWrapStyle: CSSProperties = {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'flex-start',
};

const barraTrackStyle: CSSProperties = {
    width: '100%',
    maxWidth: 260,
    height: 10,
    borderRadius: 999,
    background: '#ffffff',
    border: '1px solid #d9cfe6',
    overflow: 'hidden',
    position: 'relative',
};

const barraFillStyle: CSSProperties = {
    width: '38%',
    height: '100%',
    borderRadius: 999,
    background: '#b8a6d1',
    animation: 'migrazioneBarra 1.1s ease-in-out infinite',
};

const barraTextStyle: CSSProperties = {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: '#5b4b78',
    fontWeight: 600,
};

const migrazioneAvviataWrapStyle: CSSProperties = {
    marginTop: 18,
    minHeight: 96,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
};

const migrazioneCheckCircleStyle: CSSProperties = {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: '#ffffff',
    border: '1px solid #d9cfe6',
    color: '#5b4b78',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(91, 75, 120, 0.08)',
    boxSizing: 'border-box',
};

const migrazioneAvviataLabelStyle: CSSProperties = {
    fontSize: 15,
    lineHeight: 1.4,
    color: '#5b4b78',
    fontWeight: 700,
    textAlign: 'center',
};
const boxAvvisoMigrazioneStyle: CSSProperties = {
    marginTop: 16,
    padding: '18px 20px',
    borderRadius: 16,
    background: '#f6f0ff',
    border: '1px solid #d6c2f3',
    boxShadow: '0 8px 24px rgba(91, 55, 145, 0.08)',
};

const testoBoxMigrazioneStyle: CSSProperties = {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.6,
    color: '#4b2e83',
    fontWeight: 600,
};

const cardTextStyle: CSSProperties = {
    margin: '12px 0 0 0',
    fontSize: 14,
    lineHeight: 1.6,
    color: '#5f6368',
};

