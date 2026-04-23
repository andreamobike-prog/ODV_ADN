# Provider esterno PKPASS

## Flusso aggiornato

Il pulsante `Aggiungi ad Apple Wallet` continua a chiamare:

- `GET /api/wallet/apple/member/:id`
- `GET /api/wallet/apple/volunteer/:id`

La route:

1. valida `type`
2. recupera il soggetto reale con `getWalletSubject()`
3. legge la configurazione visuale ufficiale con `getWalletWalletConfig()`
4. normalizza la configurazione con `normalizeWalletWalletConfig()`
5. costruisce il payload provider con `buildProviderPassPayload(subject, config)`
6. chiama `POST https://api.walletwallet.dev/api/pkpass`
7. restituisce al browser il file `.pkpass`

## Configurazione condivisa

La sorgente ufficiale della configurazione WalletWallet e `tessera_settings.walletwallet_visual_config`.

La stessa configurazione viene usata da:

- editor in `app/(gestionale)/impostazioni`
- preview in Impostazioni
- builder del payload verso WalletWallet

Se il JSON non esiste ancora, `getWalletWalletConfig()` applica fallback sensati e una migrazione minima dai dati legacy.

## Campi supportati dal provider

Il payload generato verso WalletWallet usa:

- `barcodeValue`
- `barcodeFormat`
- `logoText`
- `colorPreset`
- `headerFields`
- `primaryFields`
- `secondaryFields`
- `backFields`

Regola chiave: il provider reale rende in modo stabile un solo `primaryField`. Se la configurazione ne contiene piu di uno, il primo resta in `primaryFields` e i successivi vengono spostati all'inizio di `secondaryFields`.

`barcodeValue` usa il codice reale del soggetto quando disponibile (`cardNumber`), altrimenti `qrValue`, con `barcodeFormat = "QR"`.

## Placeholder dinamici

I `value` dei campi possono contenere placeholder string-based:

- `{{fullName}}`
- `{{cardNumber}}`
- `{{roleLabel}}`
- `{{email}}`
- `{{id}}`
- `{{expiryDate}}`
- `{{associationName}}`

La sostituzione avviene nel builder condiviso prima della chiamata al provider.

## Raccomandazioni layout

- usare `logoText = "Angeli dei Navigli ODV"` come default
- usare `colorPreset = "dark"` come default
- mantenere `primaryFields` limitato a `[{ label: "TESSERA", value: "{{roleLabel}} 2026" }]`
- mettere il nome completo in `secondaryFields` o `backFields`
- evitare layout con piu primary field grandi, che nel provider reale possono sovrapporsi

## File principali

- `lib/wallet/provider/normalizeWalletWalletConfig.ts`
- `lib/wallet/provider/getWalletWalletConfig.ts`
- `lib/wallet/provider/buildProviderPassPayload.ts`
- `lib/wallet/provider/createExternalPkpass.ts`
- `app/(gestionale)/impostazioni/ImpostazioniPageClient.tsx`
- `app/(gestionale)/impostazioni/actions.ts`
- `components/wallet/WalletWalletPassPreview.tsx`

## Note operative

- La preview in Impostazioni e ora allineata alle regole del provider WalletWallet.
- Il layout finale puo differire leggermente da Apple Wallet per font, spaziature e densita.
- Se il database contiene configurazioni legacy con `auxiliaryFields`, il sistema le migra in `secondaryFields` durante la normalizzazione.
