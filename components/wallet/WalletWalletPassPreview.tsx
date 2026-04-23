'use client';

import { getWalletWalletPreviewTheme } from '@/lib/wallet/provider/getWalletWalletPreviewTheme';
import type { WalletField } from '@/lib/wallet/provider/types';

type Props = {
  logoText: string;
  colorPreset: string;
  headerFields: { label: string; value: string }[];
  primaryFields: { label: string; value: string }[];
  secondaryFields: { label: string; value: string }[];
  backFields: { label: string; value: string }[];
  barcodeValue: string;
};

function createPseudoQrCells(value: string) {
  const seed = Array.from(value).reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0);

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
      const ring = localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6;
      const core = localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;
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
  headerFields,
  primaryFields,
  secondaryFields,
  backFields,
  barcodeValue,
}: Props) {
  const theme = getWalletWalletPreviewTheme(colorPreset);
  const qrCells = createPseudoQrCells(barcodeValue);
  const highlightedPrimaryField = primaryFields[0] ?? null;
  const frontInfoFields = secondaryFields.slice(0, 4);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          border: `1px solid ${theme.border}`,
          background: theme.background,
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
        }}
      >
        <div
          style={{
            height: 18,
            borderBottom: `1px solid ${theme.border}`,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        />

        <div style={{ padding: 22, display: 'grid', gap: 22 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: headerFields.length > 0 ? 'minmax(0, 1.4fr) minmax(0, 1fr)' : '1fr',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                color: theme.foreground,
                fontSize: 26,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -0.4,
                wordBreak: 'break-word',
              }}
            >
              {logoText}
            </div>

            {headerFields.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: headerFields.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                  gap: 10,
                }}
              >
                {headerFields.map((field, index) => (
                  <FieldBlock key={`header-${index}`} field={field} tone={theme} valueSize={14} />
                ))}
              </div>
            ) : null}
          </div>

          {highlightedPrimaryField ? (
            <div
              style={{
                display: 'grid',
                gap: 6,
                paddingTop: 10,
                borderTop: `1px solid ${theme.border}`,
              }}
            >
              <div
                style={{
                  color: theme.mutedText,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}
              >
                {highlightedPrimaryField.label}
              </div>
              <div
                style={{
                  color: theme.foreground,
                  fontSize: 31,
                  fontWeight: 900,
                  lineHeight: 1.02,
                  wordBreak: 'break-word',
                }}
              >
                {highlightedPrimaryField.value}
              </div>
            </div>
          ) : null}

          {frontInfoFields.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: frontInfoFields.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                gap: 14,
                paddingTop: 2,
                borderTop: `1px solid ${theme.border}`,
              }}
            >
              {frontInfoFields.map((field, index) => (
                <FieldBlock key={`secondary-${index}`} field={field} tone={theme} valueSize={16} />
              ))}
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gap: 12,
              paddingTop: 8,
              borderTop: `1px solid ${theme.border}`,
              justifyItems: 'center',
            }}
          >
            <div
              aria-hidden
              style={{
                width: '100%',
                maxWidth: 250,
                aspectRatio: '1 / 1',
                background: '#ffffff',
                borderRadius: 16,
                padding: 14,
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

      <div
        style={{
          borderRadius: 20,
          border: '1px solid #e5e7eb',
          background: '#ffffff',
          padding: 18,
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
          Retro
        </div>

        {backFields.length > 0 ? (
          backFields.map((field, index) => (
            <div
              key={`back-${index}`}
              style={{
                display: 'grid',
                gap: 4,
                paddingTop: index === 0 ? 0 : 12,
                borderTop: index === 0 ? 'none' : '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                {field.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}>
                {field.value}
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 14, color: '#64748b' }}>Nessun back field configurato.</div>
        )}
      </div>
    </div>
  );
}
