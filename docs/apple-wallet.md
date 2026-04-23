# Apple Wallet

## Cosa è stato implementato

La scheda dettaglio di ogni socio e di ogni volontario mostra il pulsante:

- Aggiungi ad Apple Wallet

Il pulsante punta a una route server-side che genera un file `.pkpass` personale basato sull'ID del record.

## File creati o modificati

- `lib/wallet/types.ts`
- `lib/wallet/getWalletSubject.ts`
- `lib/wallet/apple/createApplePass.ts`
- `app/api/wallet/apple/[type]/[id]/route.ts`
- `components/wallet/AppleWalletButton.tsx`
- `components/soci/SocioDetailClient.tsx`
- `components/volontari/VolontarioDetailClient.tsx`
- `.env.example`
- `docs/apple-wallet.md`

## Variabili ambiente richieste

```env
APPLE_WALLET_PASS_TYPE_IDENTIFIER=
APPLE_WALLET_TEAM_IDENTIFIER=
APPLE_WALLET_ORGANIZATION_NAME=
APPLE_WALLET_CERT_PATH=
APPLE_WALLET_KEY_PATH=
APPLE_WALLET_WWDR_PATH=
APPLE_WALLET_KEY_PASSPHRASE=
APPLE_WALLET_TEMPLATE_PATH=
```

## Configurazione certificati Apple Wallet

Apple Wallet richiede:

- Pass Type ID creato nell'Apple Developer Portal
- Team ID Apple
- certificato Wallet signer in formato PEM
- private key del certificato in formato PEM
- certificato Apple WWDR in formato PEM
- eventuale passphrase della private key
- una cartella template `.pass` con `pass.json`, icone e logo

`APPLE_WALLET_TEMPLATE_PATH` deve puntare alla cartella template. Il template deve contenere gli asset minimi richiesti da Apple Wallet, inclusa almeno l'icona. `passkit-generator` genera manifest e firma al momento della richiesta.

## Come testare in locale

1. Configura Supabase in `.env.local`.
2. Configura le variabili `APPLE_WALLET_*`.
3. Avvia il progetto con `npm run dev`.
4. Apri una scheda dettaglio socio o volontario.
5. Clicca `Aggiungi ad Apple Wallet`.

Endpoint diretto:

```txt
GET /api/wallet/apple/member/<id>
GET /api/wallet/apple/volunteer/<id>
```

Se la configurazione è completa, la route restituisce un file `.pkpass` con:

- `Content-Type: application/vnd.apple.pkpass`
- `Content-Disposition: attachment; filename="card-<type>-<id>.pkpass"`

Se mancano env, certificati o template, la route restituisce un errore JSON leggibile senza stack trace.

## Limiti attuali

- Il template Apple `.pass` non è incluso nel repository.
- Non è implementato un web service Apple Wallet per aggiornare pass già installati.
- La validità, revoca o sincronizzazione remota delle tessere installate non è ancora gestita.
