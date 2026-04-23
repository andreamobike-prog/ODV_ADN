# Provider esterno PKPASS

## Flusso

Il pulsante `Aggiungi ad Apple Wallet` nelle schede socio e volontario chiama:

- `GET /api/wallet/apple/member/:id`
- `GET /api/wallet/apple/volunteer/:id`

La route:

1. valida `type`
2. recupera i dati reali da Supabase con `getWalletSubject()`
3. legge `WALLETWALLET_API_KEY` solo lato server
4. chiama `POST https://api.walletwallet.dev/api/pkpass`
5. restituisce al browser il file `.pkpass` come attachment

Il barcode inviato al provider contiene sempre:

- `member:<id>` per i soci
- `volunteer:<id>` per i volontari

## Sicurezza

- La API key vive solo nel server.
- Il client chiama solo la route locale `/api/wallet/apple/...`.
- La chiave non viene serializzata in componenti React e non viene loggata.
- Se `WALLETWALLET_API_KEY` manca o è vuota, la UI mostra un errore leggibile.

## Variabili ambiente richieste

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
WALLETWALLET_API_KEY=
```

## File creati o modificati

- `lib/wallet/types.ts`
- `lib/wallet/getWalletSubject.ts`
- `lib/wallet/provider/config.ts`
- `lib/wallet/provider/createExternalPkpass.ts`
- `app/api/wallet/apple/[type]/[id]/route.ts`
- `components/wallet/AppleWalletButton.tsx`
- `components/soci/SocioDetailClient.tsx`
- `components/volontari/VolontarioDetailClient.tsx`
- `.env.example`
- `docs/external-pkpass-provider.md`

## Test locale

1. imposta `WALLETWALLET_API_KEY` in `.env.local`
2. avvia il progetto con `npm run build` o `npm run dev`
3. apri una scheda socio o volontario
4. clicca `Aggiungi ad Apple Wallet`
5. verifica che venga scaricato un file `.pkpass`
6. se la chiave manca, verifica che la UI mostri l'errore di configurazione
