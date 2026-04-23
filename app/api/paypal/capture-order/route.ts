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
    console.error('PAYPAL ACCESS TOKEN ERROR', data);
    throw new Error(
      data?.error_description ||
        data?.error ||
        'Errore access token PayPal.'
    );
  }

  return data.access_token as string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderID = String(body?.orderID || '').trim();

    if (!orderID) {
      return NextResponse.json(
        { ok: false, error: 'orderID mancante.' },
        { status: 400 }
      );
    }

    const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
    const accessToken = await getAccessToken();

    const response = await fetch(`${apiBase}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PAYPAL CAPTURE ERROR', data);

      const details = Array.isArray(data?.details)
        ? data.details
            .map((detail: any) => detail?.description || detail?.issue)
            .filter(Boolean)
            .join(' | ')
        : '';

      return NextResponse.json(
        {
          ok: false,
          error:
            details ||
            data?.message ||
            data?.name ||
            'Errore capture PayPal.',
          paypalDebugId: data?.debug_id || '',
          paypalDetails: data?.details || [],
        },
        { status: 500 }
      );
    }

    const captureId =
      data?.purchase_units?.[0]?.payments?.captures?.[0]?.id || '';

    if (!captureId) {
      console.error('PAYPAL CAPTURE WITHOUT CAPTURE ID', data);

      return NextResponse.json(
        {
          ok: false,
          error: 'Capture PayPal completata ma captureID non trovato.',
          paypalData: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      captureID: captureId,
      paypalData: data,
    });
  } catch (error) {
    console.error('PAYPAL CAPTURE FATAL ERROR', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Errore PayPal.',
      },
      { status: 500 }
    );
  }
}