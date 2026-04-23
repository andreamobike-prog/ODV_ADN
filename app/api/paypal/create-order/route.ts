import { NextResponse } from 'next/server';

function getBasicAuth() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error('Credenziali PayPal mancanti.');
  }

  return Buffer.from(`${clientId}:${secret}`).toString('base64');
}

async function getAccessToken() {
  const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${getBasicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error_description || 'Errore access token PayPal.');
  }

  return data.access_token as string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const minorenne = String(body?.minorenne || '').trim().toLowerCase();

    const importo = minorenne === 'si' ? 20 : 30;

    const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
    const accessToken = await getAccessToken();

    const response = await fetch(`${apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'EUR',
              value: importo.toFixed(2),
            },
          },
        ],
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: data?.message || 'Errore creazione ordine PayPal.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderID: data.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Errore PayPal.',
      },
      { status: 500 }
    );
  }
}