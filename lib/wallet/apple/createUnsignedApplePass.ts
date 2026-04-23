import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { zipSync } from 'fflate';
import type { UnsignedAppleWalletConfig } from '@/lib/wallet/apple/config';
import type { WalletSubject } from '@/lib/wallet/types';

type ZipFiles = Record<string, Uint8Array>;

async function collectTemplateFiles(rootPath: string, currentPath = rootPath): Promise<ZipFiles> {
  const entries = await readdir(currentPath, { withFileTypes: true });
  const files: ZipFiles = {};

  for (const entry of entries) {
    const absolutePath = join(currentPath, entry.name);
    const relativePath = relative(rootPath, absolutePath).split(sep).join('/');

    if (entry.name.startsWith('.') || entry.name === 'README.md') continue;
    if (relativePath === 'manifest.json' || relativePath === 'signature') continue;

    if (entry.isDirectory()) {
      Object.assign(files, await collectTemplateFiles(rootPath, absolutePath));
      continue;
    }

    files[relativePath] = await readFile(absolutePath);
  }

  return files;
}

function createPassJson(config: UnsignedAppleWalletConfig, subject: WalletSubject) {
  return {
    formatVersion: 1,
    passTypeIdentifier: config.passTypeIdentifier,
    serialNumber: `${subject.type}-${subject.id}`,
    teamIdentifier: config.teamIdentifier,
    organizationName: config.organizationName,
    description: 'Tessera digitale ODV',
    logoText: config.organizationName,
    foregroundColor: 'rgb(255,255,255)',
    backgroundColor: 'rgb(147,12,77)',
    labelColor: 'rgb(245,232,247)',
    storeCard: {
      primaryFields: [
        {
          key: 'fullName',
          label: 'Titolare',
          value: subject.fullName,
        },
      ],
      secondaryFields: [
        {
          key: 'role',
          label: 'Tipo',
          value: subject.roleLabel,
        },
      ],
      auxiliaryFields: [
        {
          key: 'cardNumber',
          label: 'Numero tessera',
          value: subject.cardNumber,
        },
      ],
      backFields: [
        {
          key: 'cardNumberBack',
          label: 'Numero tessera',
          value: subject.cardNumber,
        },
        {
          key: 'internalId',
          label: 'ID',
          value: subject.id,
        },
        ...(subject.email
          ? [
              {
                key: 'email',
                label: 'Email',
                value: subject.email,
              },
            ]
          : []),
      ],
    },
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: subject.qrValue,
        messageEncoding: 'iso-8859-1',
        altText: subject.cardNumber,
      },
    ],
  };
}

function createManifest(files: ZipFiles) {
  return Object.fromEntries(
    Object.entries(files).map(([path, content]) => [
      path,
      createHash('sha1').update(content).digest('hex'),
    ])
  );
}

export async function createUnsignedApplePass(
  config: UnsignedAppleWalletConfig,
  subject: WalletSubject
): Promise<Buffer> {
  const files = await collectTemplateFiles(config.templatePath);
  files['pass.json'] = Buffer.from(JSON.stringify(createPassJson(config, subject), null, 2));
  files['manifest.json'] = Buffer.from(JSON.stringify(createManifest(files), null, 2));

  return Buffer.from(zipSync(files, { level: 6 }));
}
