import { NextResponse } from 'next/server';
import { getWalletSubject, WalletSubjectNotFoundError } from '@/lib/wallet/getWalletSubject';
import { ExternalPkpassProviderError, createExternalPkpass } from '@/lib/wallet/provider/createExternalPkpass';
import { WalletProviderConfigError } from '@/lib/wallet/provider/config';
import { isWalletEntityType } from '@/lib/wallet/types';

export const runtime = 'nodejs';

function sanitizeId(id: string) {
  return id.trim();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ type: string; id: string }> }
) {
  const { type: rawType, id: rawId } = await context.params;
  const id = sanitizeId(rawId);

  if (!isWalletEntityType(rawType)) {
    return NextResponse.json({ ok: false, message: 'Tipo tessera non valido.' }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ ok: false, message: 'ID tessera non valido.' }, { status: 400 });
  }

  try {
    const subject = await getWalletSubject(rawType, id);
    const passBuffer = await createExternalPkpass(subject);

    return new Response(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="card-${subject.type}-${subject.id}.pkpass"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    if (error instanceof WalletSubjectNotFoundError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 404 });
    }

    const message =
      error instanceof WalletProviderConfigError || error instanceof ExternalPkpassProviderError
        ? error.message
        : 'Impossibile generare la tessera Apple Wallet.';

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 }
    );
  }
}
