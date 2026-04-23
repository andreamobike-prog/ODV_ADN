'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type Props = {
  nome: string;
  cognome: string;
  codiceTessera: string;
  annoValidita: number | string;
  nomeAssociazione: string;
  titoloTessera: string;
  coloreSfondo: string;
  coloreTesto: string;
  coloreAccento: string;
  logoUrl?: string | null;
  immagineCentraleUrl?: string | null;
  publicToken?: string | null;
};

function getNomeAssociazioneFontSize(value?: string | null) {
  const safeValue = (value ?? '').trim();
  const len = safeValue.length;

  if (len <= 18) return 28;
  if (len <= 24) return 25;
  if (len <= 30) return 22;
  if (len <= 36) return 19;

  return 17;
}

function getQrValue(publicToken?: string | null) {
  if (!publicToken) return '';

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';

  return `${baseUrl}/tessera/${publicToken}`;
}

export function TesseraPreviewCard({
  nome,
  cognome,
  codiceTessera,
  annoValidita,
  nomeAssociazione,
  titoloTessera,
  coloreSfondo,
  coloreTesto,
  coloreAccento,
  logoUrl,
  immagineCentraleUrl,
  publicToken,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const value = getQrValue(publicToken);

    if (!value) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(value, {
      width: 200,
      margin: 0,
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [publicToken]);

  return (
    <div
      style={{
        width: 419,
        height: 513,
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        background: coloreSfondo,
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.10)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 12,
          background: coloreAccento,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 0,
          width: '100%',
          height: 110,
          background: coloreSfondo,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 122,
          left: 0,
          width: '100%',
          height: 175,
          background: '#cfcfcf',
          overflow: 'hidden',
        }}
      >
        {immagineCentraleUrl ? (
          <img
            src={immagineCentraleUrl}
            alt="Immagine centrale tessera"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            IMMAGINE
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 297,
          left: 0,
          width: '100%',
          height: 216,
          background: coloreSfondo,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 25,
          top: 53,
          color: coloreAccento,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        {titoloTessera}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 25,
          top: 70,
          width: 250,
          color: coloreTesto,
          fontSize: getNomeAssociazioneFontSize(nomeAssociazione),
          fontWeight: 500,
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {nomeAssociazione}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 310,
          top: 32,
          width: 75,
          height: 75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo associazione"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 0,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: coloreTesto,
                fontSize: 10,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              LOGO
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 25,
          top: 322,
          color: coloreAccento,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        Codice tessera
      </div>

      <div
        style={{
          position: 'absolute',
          left: 25,
          top: 340,
          color: coloreTesto,
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {codiceTessera}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 285,
          top: 322,
          color: coloreAccento,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        Scadenza
      </div>

      <div
        style={{
          position: 'absolute',
          left: 285,
          top: 340,
          color: coloreTesto,
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        31/12/{annoValidita}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 25,
          top: 395,
          color: coloreAccento,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        Titolare
      </div>

      <div
        style={{
          position: 'absolute',
          left: 25,
          top: 415,
          width: 200,
          color: coloreTesto,
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1.04,
        }}
      >
        {nome} {cognome}
      </div>

            <div
        style={{
          position: 'absolute',
          left: 285,
          top: 400,
          width: 70,
          height: 70,
          borderRadius: 8,
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR tessera"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <span
            style={{
              color: '#6b7280',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            QR
          </span>
        )}
      </div>
    </div>
  );
}