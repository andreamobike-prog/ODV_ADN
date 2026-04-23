import { Buffer } from 'node:buffer';
import type { WalletSubject } from '@/lib/wallet/types';
import { buildProviderPassPayload } from '@/lib/wallet/provider/buildProviderPassPayload';
import { getWalletProviderConfig } from '@/lib/wallet/provider/config';
import { getWalletWalletConfig } from '@/lib/wallet/provider/getWalletWalletConfig';

export class ExternalPkpassProviderError extends Error {
  constructor(message = 'Impossibile generare la tessera Apple Wallet.') {
    super(message);
    this.name = 'ExternalPkpassProviderError';
  }
}

async function readProviderError(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const payload = (await response.json()) as {
        message?: string;
        error?: string;
        detail?: string;
      };

      return payload.message || payload.error || payload.detail || null;
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text.trim() || null;
  } catch {
    return null;
  }
}

export async function createExternalPkpass(subject: WalletSubject): Promise<Buffer> {
  const { apiKey, endpoint } = getWalletProviderConfig();
  const config = await getWalletWalletConfig();
  const payload = buildProviderPassPayload(subject, config);

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    throw new ExternalPkpassProviderError(
      'Provider Apple Wallet non raggiungibile. Riprova tra qualche minuto.'
    );
  }

  if (!response.ok) {
    const providerMessage = await readProviderError(response);
    const message = providerMessage
      ? `Provider Apple Wallet: ${providerMessage}`
      : `Provider Apple Wallet ha risposto con errore ${response.status}.`;

    throw new ExternalPkpassProviderError(message);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
