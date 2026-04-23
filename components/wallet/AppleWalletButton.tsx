'use client';

import { Component, type ReactNode, useState } from 'react';
import type { WalletEntityType } from '@/lib/wallet/types';

interface AppleWalletButtonProps {
  type: WalletEntityType;
  id: string;
  className?: string;
}

function AppleWalletFallback({ className }: { className?: string }) {
  return (
    <button type="button" className={`button${className ? ` ${className}` : ''}`} disabled>
      Apple Wallet non disponibile
    </button>
  );
}

class AppleWalletErrorBoundary extends Component<
  { children: ReactNode; className?: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <AppleWalletFallback className={this.props.className} />;
    }

    return this.props.children;
  }
}

function AppleWalletButtonInner({ type, id, className }: AppleWalletButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const href = `/api/wallet/apple/${encodeURIComponent(type)}/${encodeURIComponent(id)}`;

  async function handleDownload() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(href, {
        method: 'GET',
        cache: 'no-store',
      });

      const contentType = response.headers.get('content-type') ?? '';

      if (response.ok && contentType.includes('application/vnd.apple.pkpass')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `card-${type}-${id}.pkpass`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      }

      if (contentType.includes('application/json')) {
        const payload = (await response.json()) as { message?: string };
        setError(payload.message || 'Errore durante la generazione della tessera Apple Wallet.');
        return;
      }

      setError('Risposta non valida dal server.');
    } catch {
      setError('Download non riuscito. Riprova tra qualche minuto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <button
        type="button"
        className={`button${className ? ` ${className}` : ''}`}
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? 'Preparazione Wallet...' : 'Aggiungi ad Apple Wallet'}
      </button>
      {error && (
        <div role="alert" style={{ color: '#991b1b', fontSize: 14, lineHeight: 1.35 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export function AppleWalletButton(props: AppleWalletButtonProps) {
  if (!props.id || !props.type) {
    return <AppleWalletFallback className={props.className} />;
  }

  return (
    <AppleWalletErrorBoundary className={props.className}>
      <AppleWalletButtonInner {...props} />
    </AppleWalletErrorBoundary>
  );
}
