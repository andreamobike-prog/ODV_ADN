export class WalletProviderConfigError extends Error {
  constructor(message = 'Provider Apple Wallet non configurato. Imposta WALLETWALLET_API_KEY.') {
    super(message);
    this.name = 'WalletProviderConfigError';
  }
}

export interface WalletProviderConfig {
  apiKey: string;
  endpoint: string;
}

const PROVIDER_ENDPOINT = 'https://api.walletwallet.dev/api/pkpass';

export function getWalletProviderConfig(): WalletProviderConfig {
  const apiKey = process.env.WALLETWALLET_API_KEY?.trim();

  if (!apiKey) {
    throw new WalletProviderConfigError();
  }

  return {
    apiKey,
    endpoint: PROVIDER_ENDPOINT,
  };
}
