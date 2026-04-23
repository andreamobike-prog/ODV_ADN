import { access, stat } from 'node:fs/promises';
import { join } from 'node:path';

export class AppleWalletConfigError extends Error {
  constructor(message = 'Configurazione Apple Wallet mancante.') {
    super(message);
    this.name = 'AppleWalletConfigError';
  }
}

interface AppleWalletBaseConfig {
  mode: 'signed' | 'unsigned';
  passTypeIdentifier: string;
  teamIdentifier: string;
  organizationName: string;
  templatePath: string;
}

export interface SignedAppleWalletConfig extends AppleWalletBaseConfig {
  mode: 'signed';
  certPath: string;
  keyPath: string;
  wwdrPath: string;
  keyPassphrase: string;
}

export interface UnsignedAppleWalletConfig extends AppleWalletBaseConfig {
  mode: 'unsigned';
}

export type AppleWalletConfig = SignedAppleWalletConfig | UnsignedAppleWalletConfig;

const SIGNED_ENV_KEYS = [
  'APPLE_WALLET_PASS_TYPE_IDENTIFIER',
  'APPLE_WALLET_TEAM_IDENTIFIER',
  'APPLE_WALLET_ORGANIZATION_NAME',
  'APPLE_WALLET_CERT_PATH',
  'APPLE_WALLET_KEY_PATH',
  'APPLE_WALLET_WWDR_PATH',
  'APPLE_WALLET_KEY_PASSPHRASE',
  'APPLE_WALLET_TEMPLATE_PATH',
] as const;

const CERT_ENV_KEYS = [
  'APPLE_WALLET_CERT_PATH',
  'APPLE_WALLET_KEY_PATH',
  'APPLE_WALLET_WWDR_PATH',
  'APPLE_WALLET_KEY_PASSPHRASE',
] as const;

const REQUIRED_TEMPLATE_FILES = ['pass.json', 'icon.png', 'logo.png'] as const;

async function fileExists(path: string) {
  try {
    const info = await stat(path);
    return info.isFile();
  } catch {
    return false;
  }
}

async function directoryExists(path: string) {
  try {
    const info = await stat(path);
    return info.isDirectory();
  } catch {
    return false;
  }
}

function envValue(name: (typeof SIGNED_ENV_KEYS)[number]) {
  return process.env[name]?.trim() ?? '';
}

function defaultTemplatePath() {
  return join(process.cwd(), 'wallet-templates', 'odv-card.pass');
}

export async function getAppleWalletConfig(): Promise<AppleWalletConfig> {
  const missing: string[] = [];

  const values = Object.fromEntries(
    SIGNED_ENV_KEYS.map((key) => {
      const value = envValue(key);
      return [key, value];
    })
  ) as Record<(typeof SIGNED_ENV_KEYS)[number], string>;

  const hasCertificateConfig = CERT_ENV_KEYS.some((key) => Boolean(values[key]));
  const templatePath = values.APPLE_WALLET_TEMPLATE_PATH || defaultTemplatePath();

  if (hasCertificateConfig) {
    SIGNED_ENV_KEYS.forEach((key) => {
      if (!values[key]) missing.push(key);
    });
  }

  const fileChecks = [
    ['APPLE_WALLET_CERT_PATH', values.APPLE_WALLET_CERT_PATH],
    ['APPLE_WALLET_KEY_PATH', values.APPLE_WALLET_KEY_PATH],
    ['APPLE_WALLET_WWDR_PATH', values.APPLE_WALLET_WWDR_PATH],
  ] as const;

  if (hasCertificateConfig) {
    await Promise.all(
      fileChecks.map(async ([label, path]) => {
        if (!path) return;

        try {
          await access(path);
        } catch {
          missing.push(`${label} non leggibile: ${path}`);
          return;
        }

        if (!(await fileExists(path))) {
          missing.push(`${label} non è un file: ${path}`);
        }
      })
    );
  }

  if (!(await directoryExists(templatePath))) {
    missing.push(`APPLE_WALLET_TEMPLATE_PATH non è una cartella: ${templatePath}`);
  } else {
    await Promise.all(
      REQUIRED_TEMPLATE_FILES.map(async (fileName) => {
        const assetPath = join(templatePath, fileName);
        if (!(await fileExists(assetPath))) {
          missing.push(`Template Apple Wallet incompleto, manca ${fileName}: ${assetPath}`);
        }
      })
    );
  }

  if (missing.length > 0) {
    throw new AppleWalletConfigError(
      `Configurazione Apple Wallet incompleta: ${missing.join('; ')}`
    );
  }

  const baseConfig = {
    passTypeIdentifier: values.APPLE_WALLET_PASS_TYPE_IDENTIFIER || 'pass.local.odv.card',
    teamIdentifier: values.APPLE_WALLET_TEAM_IDENTIFIER || 'LOCALTEAM',
    organizationName: values.APPLE_WALLET_ORGANIZATION_NAME || 'ODV',
    templatePath,
  };

  if (!hasCertificateConfig) {
    return {
      mode: 'unsigned',
      ...baseConfig,
    };
  }

  return {
    mode: 'signed',
    ...baseConfig,
    certPath: values.APPLE_WALLET_CERT_PATH,
    keyPath: values.APPLE_WALLET_KEY_PATH,
    wwdrPath: values.APPLE_WALLET_WWDR_PATH,
    keyPassphrase: values.APPLE_WALLET_KEY_PASSPHRASE,
  };
}
