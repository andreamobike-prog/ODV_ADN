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
- `logoURL`
- `stripURL`
- `backgroundColor` se configurato
- `headerFields`
- `primaryFields`
- `secondaryFields`
- `auxiliaryFields`
- `backFields`

Regola chiave: se `stripURL` e attivo non bisogna usare `primaryFields`. Il sistema li rimuove automaticamente dal payload per evitare testo sopra l'immagine centrale.

Con strip attiva il fronte viene costruito con:

- `logoText` in alto
- `logoURL` opzionale nel header
- `stripURL` centrale senza testo sovrapposto
- `secondaryFields` sotto l'immagine per i dati leggibili
- `auxiliaryFields = []`
- QR grande in basso

Apple Wallet e WalletWallet non permettono un layout libero sopra la strip image: i dati frontali leggibili vanno quindi messi in `secondaryFields`, non in `primaryFields`.

`barcodeValue` usa il codice reale del soggetto quando disponibile (`cardNumber`), altrimenti `qrValue`, con `barcodeFormat = "QR"`.

Gli asset avanzati vengono inviati solo se risolvono a URL pubblici HTTPS:

- `logoURL`: priorita a `walletwallet_visual_config.logoURL`, poi asset tessera salvato, poi fallback `/logo.png`
- `stripURL`: priorita a `walletwallet_visual_config.stripURL`, poi asset tessera `immagine_centrale_url`
- `NEXT_PUBLIC_APP_BASE_URL` o `APP_BASE_URL` vengono usati per trasformare i path `/public` in URL assoluti

Se `public/wallet-strip.png` non esiste, il sistema non inventa un file binario e non invia `stripURL`.

## Placeholder dinamici

I `value` dei campi possono contenere placeholder string-based:

- `{{fullName}}`
- `{{fullNameUpper}}`
- `{{cardNumber}}`
- `{{roleLabel}}`
- `{{email}}`
- `{{id}}`
- `{{expiryDate}}`
- `{{associationName}}`

La sostituzione avviene nel builder condiviso prima della chiamata al provider.

## Raccomandazioni layout

- usare `logoText = "ANGELI DEI NAVIGLI"` come default
- usare `colorPreset = "blue"` come default
- se `stripURL` e attivo mantenere `primaryFields = []`
- usare `secondaryFields = [{ label: "SOCIO", value: "{{fullName}}" }, { label: "COD. SOCIO", value: "{{cardNumber}}" }, { label: "SCADENZA", value: "{{expiryDate}}" }]`
- usare `backFields = [{ label: "Nome", value: "{{fullName}}" }, { label: "TIPO", value: "{{roleLabel}}" }, { label: "EMAIL", value: "{{email}}" }, { label: "ID", value: "{{id}}" }]`
- usare il logo a sinistra e una strip panoramica centrale tramite `logoURL` e `stripURL`

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
- La preview mostra anche `logoURL` e `stripURL` effettivamente inviati al provider.
- L'interfaccia avvisa che gli asset funzionano solo con URL pubblici HTTPS e con un piano WalletWallet compatibile.
- Il layout finale puo differire leggermente da Apple Wallet per font, spaziature e densita.
- Se il database contiene configurazioni legacy con `auxiliaryFields`, il sistema le migra in `secondaryFields` durante la normalizzazione e invia `auxiliaryFields: []` al provider.
