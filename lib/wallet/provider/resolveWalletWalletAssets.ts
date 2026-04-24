import type { WalletWalletVisualConfig } from '@/lib/wallet/provider/types';

export type WalletWalletResolvedAssets = {
  baseUrl?: string;
  logoURL?: string;
  stripURL?: string;
  backgroundColor?: string;
  warnings: string[];
};

function sanitizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function isPublicHttpsUrl(value: string) {
  if (!/^https:\/\//i.test(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return !['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
  } catch {
    return false;
  }
}

function resolveAssetCandidate(candidate: string, baseUrl?: string) {
  if (!candidate) {
    return '';
  }

  if (isHttpUrl(candidate)) {
    return candidate;
  }

  if (candidate.startsWith('/') && baseUrl) {
    return `${baseUrl}${candidate}`;
  }

  return '';
}

export function resolveWalletWalletAssets(
  config: WalletWalletVisualConfig
): WalletWalletResolvedAssets {
  const warnings: string[] = [];
  const baseUrlInput =
    sanitizeString(process.env.NEXT_PUBLIC_APP_BASE_URL) || sanitizeString(process.env.APP_BASE_URL);
  const baseUrl = baseUrlInput ? normalizeBaseUrl(baseUrlInput) : undefined;
  const proAssetsEnabled = sanitizeString(process.env.WALLETWALLET_ENABLE_PRO_ASSETS) !== 'false';

  if (!proAssetsEnabled) {
    return {
      baseUrl,
      backgroundColor: sanitizeString(config.backgroundColor) || undefined,
      warnings,
    };
  }

  const logoCandidate = sanitizeString(config.logoURL) || '/logo.png';
  const resolvedLogoURL = resolveAssetCandidate(logoCandidate, baseUrl);

  if (!resolvedLogoURL && logoCandidate.startsWith('/')) {
    warnings.push(
      'logoURL non disponibile: imposta NEXT_PUBLIC_APP_BASE_URL o APP_BASE_URL con un URL pubblico HTTPS.'
    );
  } else if (resolvedLogoURL && !isPublicHttpsUrl(resolvedLogoURL)) {
    warnings.push('logoURL ignorato: WalletWallet accetta solo URL pubblici HTTPS, non localhost.');
  }

  const stripCandidate = sanitizeString(config.stripURL);
  const resolvedStripURL = resolveAssetCandidate(stripCandidate, baseUrl);

  if (stripCandidate && !resolvedStripURL && stripCandidate.startsWith('/')) {
    warnings.push(
      'stripURL non disponibile: imposta NEXT_PUBLIC_APP_BASE_URL o APP_BASE_URL con un URL pubblico HTTPS.'
    );
  } else if (resolvedStripURL && !isPublicHttpsUrl(resolvedStripURL)) {
    warnings.push('stripURL ignorato: WalletWallet accetta solo URL pubblici HTTPS, non localhost.');
  }

  return {
    baseUrl,
    logoURL: isPublicHttpsUrl(resolvedLogoURL) ? resolvedLogoURL : undefined,
    stripURL: isPublicHttpsUrl(resolvedStripURL) ? resolvedStripURL : undefined,
    backgroundColor: sanitizeString(config.backgroundColor) || undefined,
    warnings,
  };
}
