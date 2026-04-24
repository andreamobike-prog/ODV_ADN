'use client';

import { getWalletWalletPreviewTheme } from '@/lib/wallet/provider/getWalletWalletPreviewTheme';
import type { WalletField } from '@/lib/wallet/provider/types';

type Props = {
  logoText: string;
  colorPreset: string;
  logoURL?: string;
  stripURL?: string;
  backgroundColor?: string;
  secondaryFields: { label: string; value: string }[];
  barcodeValue: string;
};

function createPseudoQrCells(value: string) {
  const seed = Array.from(value).reduce(
    (total, char, index) => total + char.charCodeAt(0) * (index + 1),
    0
  );

  return Array.from({ length: 29 * 29 }, (_, index) => {
    const row = Math.floor(index / 29);
    const column = index % 29;
    const inFinder =
      (row < 7 && column < 7) ||
      (row < 7 && column > 21) ||
      (row > 21 && column < 7);

    if (inFinder) {
      const localRow = row > 21 ? row - 22 : row;
      const localColumn = column > 21 ? column - 22 : column;
      const ring =
        localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6;
      const core =
        localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;
      return ring || core;
    }

    return ((seed + row * 17 + column * 31 + row * column) % 5) < 2;
  });
}

function FieldBlock({
  field,
  tone,
  valueSize,
}: {
  field: WalletField;
  tone: { foreground: string; mutedText: string };
  valueSize: number;
}) {
  return (
    <div style={{ minWidth: 0, display: 'grid', gap: 4 }}>
      <div
        style={{
          color: tone.mutedText,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        {field.label}
      </div>
      <div
        style={{
          color: tone.foreground,
          fontSize: valueSize,
          fontWeight: 800,
          lineHeight: 1.1,
          wordBreak: 'break-word',
        }}
      >
        {field.value}
      </div>
    </div>
  );
}

export function WalletWalletPassPreview({
  logoText,
  colorPreset,
  logoURL,
  stripURL,
  backgroundColor,
  secondaryFields,
  barcodeValue,
}: Props) {
  const theme = getWalletWalletPreviewTheme(colorPreset);
  const qrCells = createPseudoQrCells(barcodeValue);
  const frontInfoFields = secondaryFields.slice(0, 3);

  return (
    <div
      style={{
        borderRadius: 28,
        overflow: 'hidden',
        border: `1px solid ${theme.border}`,
        background: backgroundColor || theme.background,
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
      }}
    >
      <div
        style={{
          height: 22,
          borderBottom: `1px solid ${theme.border}`,
          background:
            'linear-gradient(180deg, rgba(4,13,33,0.48) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      />

      <div style={{ padding: 22, display: 'grid', gap: 22 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: logoURL ? '72px minmax(0, 1fr)' : 'minmax(0, 1fr)',
            gap: 14,
            alignItems: 'center',
          }}
        >
          {logoURL ? (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                overflow: 'hidden',
                border: `1px solid ${theme.border}`,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={logoURL}
                alt="Logo pass"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#ffffff',
                }}
              />
            </div>
          ) : null}

          <div
            style={{
              color: theme.foreground,
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 0.98,
              letterSpacing: -0.6,
              textTransform: 'uppercase',
              wordBreak: 'break-word',
            }}
          >
            {logoText}
          </div>
        </div>

        <div
          style={{
            borderRadius: 22,
            overflow: 'hidden',
            border: `1px solid ${theme.border}`,
            background: 'rgba(255,255,255,0.08)',
            minHeight: 134,
          }}
        >
          {stripURL ? (
            <img
              src={stripURL}
              alt="Immagine centrale pass"
              style={{
                width: '100%',
                height: 164,
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                minHeight: 134,
                display: 'grid',
                placeItems: 'center',
                padding: 20,
                color: theme.mutedText,
                fontSize: 12,
                fontWeight: 700,
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Nessuna immagine centrale
            </div>
          )}
        </div>

        {frontInfoFields.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${frontInfoFields.length}, minmax(0, 1fr))`,
              gap: 14,
              borderTop: `1px solid ${theme.border}`,
              paddingTop: 14,
            }}
          >
            {frontInfoFields.map((field, index) => (
              <FieldBlock key={`secondary-${index}`} field={field} tone={theme} valueSize={17} />
            ))}
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gap: 12,
            paddingTop: 10,
            borderTop: `1px solid ${theme.border}`,
            justifyItems: 'center',
          }}
        >
          {frontInfoFields.length > 0 ? (
            <div
              style={{
                color: theme.mutedText,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              QR Code
            </div>
          ) : null}

          <div
            style={{
              width: '100%',
              maxWidth: 276,
              aspectRatio: '1 / 1',
              background: '#ffffff',
              borderRadius: 18,
              padding: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(29, 1fr)',
              gap: 1,
            }}
          >
            {qrCells.map((filled, index) => (
              <span
                key={index}
                style={{
                  display: 'block',
                  background: filled ? '#111827' : 'transparent',
                  borderRadius: 1,
                }}
              />
            ))}
          </div>

          <div
            style={{
              color: theme.mutedText,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.3,
              textAlign: 'center',
              wordBreak: 'break-all',
            }}
          >
            {barcodeValue}
          </div>
        </div>
      </div>
    </div>
  );
}
