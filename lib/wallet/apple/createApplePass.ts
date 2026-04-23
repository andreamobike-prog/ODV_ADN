import { readFile } from 'node:fs/promises';
import { PKPass } from 'passkit-generator';
import { getAppleWalletConfig } from '@/lib/wallet/apple/config';
import { createUnsignedApplePass } from '@/lib/wallet/apple/createUnsignedApplePass';
import type { WalletSubject } from '@/lib/wallet/types';

export async function createApplePass(subject: WalletSubject): Promise<Buffer> {
  const config = await getAppleWalletConfig();

  if (config.mode === 'unsigned') {
    return createUnsignedApplePass(config, subject);
  }

  const [signerCert, signerKey, wwdr] = await Promise.all([
    readFile(config.certPath),
    readFile(config.keyPath),
    readFile(config.wwdrPath),
  ]);

  const pass = await PKPass.from(
    {
      model: config.templatePath,
      certificates: {
        signerCert,
        signerKey,
        wwdr,
        signerKeyPassphrase: config.keyPassphrase,
      },
    },
    {
      serialNumber: `${subject.type}-${subject.id}`,
      description: 'Tessera digitale ODV',
      organizationName: config.organizationName,
      logoText: config.organizationName,
      passTypeIdentifier: config.passTypeIdentifier,
      teamIdentifier: config.teamIdentifier,
      foregroundColor: 'rgb(255,255,255)',
      backgroundColor: 'rgb(147,12,77)',
      labelColor: 'rgb(245,232,247)',
    }
  );

  pass.type = 'storeCard';
  pass.primaryFields.push({
    key: 'fullName',
    label: 'Titolare',
    value: subject.fullName,
  });
  pass.secondaryFields.push({
    key: 'role',
    label: 'Tipo',
    value: subject.roleLabel,
  });
  pass.auxiliaryFields.push({
    key: 'cardNumber',
    label: 'Numero tessera',
    value: subject.cardNumber,
  });
  pass.backFields.push(
    {
      key: 'cardNumberBack',
      label: 'Numero tessera',
      value: subject.cardNumber,
    },
    {
      key: 'internalId',
      label: 'ID',
      value: subject.id,
    }
  );

  if (subject.email) {
    pass.backFields.push({
      key: 'email',
      label: 'Email',
      value: subject.email,
    });
  }

  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: subject.qrValue,
    messageEncoding: 'iso-8859-1',
    altText: subject.cardNumber,
  });

  return pass.getAsBuffer();
}
