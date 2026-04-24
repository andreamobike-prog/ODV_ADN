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

## Configurazione utente

La sorgente ufficiale e `tessera_settings.walletwallet_visual_config`.

L'utente configura solo 4 campi:

- `logoText`
- `backgroundColor`
- `logoURL`
- `stripURL`

Formato persistito:

```json
{
  "logoText": "Angeli dei Navigli ODV",
  "backgroundColor": "#1F2947",
  "logoURL": "https://example.org/logo.png",
  "stripURL": "https://example.org/strip.png"
}
```

Se nel database esistono configurazioni legacy con `primaryFields`, `secondaryFields`, `headerFields`, `auxiliaryFields` o `backFields`, il sistema le ignora nella UI e non le usa piu nel payload finale.

## Regole UI e preview

- La UI di Impostazioni mostra solo titolo, colore esadecimale, link logo e link immagine centrale.
- Logo e immagine centrale devono essere URL pubblici `https://`.
- I dati frontali leggibili vengono generati automaticamente sotto l'immagine.
- Il QR viene generato automaticamente e resta sempre sotto i dati.
- La preview mostra solo il fronte del pass.

## Payload inviato a WalletWallet

Il payload viene costruito sempre cosi:

```ts
{
  barcodeValue: subject.cardNumber || subject.qrValue,
  barcodeFormat: "QR",
  logoText: config.logoText,
  colorPreset: mapHexToWalletWalletPreset(config.backgroundColor),
  backgroundColor: config.backgroundColor,
  foregroundColor: "#FFFFFF",
  labelColor: "#D6D6D6",
  logoURL: config.logoURL,
  stripURL: config.stripURL,
  primaryFields: [],
  secondaryFields: [
    { label: "SOCIO", value: subject.fullName },
    { label: "CODICE", value: subject.cardNumber },
    { label: "SCADENZA", value: expiryDate }
  ],
  auxiliaryFields: [],
  backFields: [
    { label: "NOME", value: subject.fullName },
    { label: "EMAIL", value: subject.email || "" },
    { label: "ID", value: subject.id }
  ]
}
```

Il sistema invia sia `backgroundColor` sia `colorPreset`. Se il provider applica solo preset, `mapHexToWalletWalletPreset(hex)` sceglie il preset piu vicino.

## Mapping colore

`mapHexToWalletWalletPreset(hex)` usa queste regole:

- blu o navy -> `blue` oppure `dark`
- verde -> `green`
- rosso -> `red`
- viola -> `purple`
- arancio -> `orange`
- colori molto scuri -> `dark`
- colori chiari o neutri -> `light`

## Note operative

- Il provider richiede URL pubblici HTTPS per `logoURL` e `stripURL`.
- Il layout reale non deve avere testo sopra l'immagine centrale.
- I dati socio, codice e scadenza non sono piu configurabili manualmente.
- Il retro continua a essere valorizzato nel payload finale, ma non compare piu nella preview di Impostazioni.
