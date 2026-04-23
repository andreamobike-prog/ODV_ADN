import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicToken: string }> }
) {
  const { publicToken } = await context.params;
  const supabase = await getSupabaseServerClient();

  const { data: tessera, error: tesseraError } = await supabase
    .from('tessere_digitali')
    .select('id, socio_id, codice_tessera, public_token, anno_validita, scadenza_al, stato')
    .eq('public_token', publicToken)
    .maybeSingle();

  if (tesseraError) {
    return NextResponse.json(
      {
        ok: false,
        message: tesseraError.message,
      },
      { status: 500 }
    );
  }

  if (!tessera) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Tessera non trovata.',
      },
      { status: 404 }
    );
  }

  const { data: socio, error: socioError } = await supabase
    .from('soci')
    .select('id, nome, cognome, email, stato, archiviato')
    .eq('id', tessera.socio_id)
    .maybeSingle();

  if (socioError) {
    return NextResponse.json(
      {
        ok: false,
        message: socioError.message,
      },
      { status: 500 }
    );
  }

  const { data: tesseraSettings, error: settingsError } = await supabase
    .from('tessera_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (settingsError) {
    return NextResponse.json(
      {
        ok: false,
        message: settingsError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        'Apple Wallet non ancora configurato. La route riconosce però già la tessera corretta.',
      publicToken,
      fallbackUrl: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/tessera/${publicToken}`,
      tessera,
      socio,
      tesseraSettings,
    },
    { status: 501 }
  );
}