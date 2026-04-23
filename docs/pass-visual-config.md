# Pass visual config

## Obiettivo

La sezione Impostazioni usa ora lo stesso modello supportato dal provider WalletWallet, con una preview che evita configurazioni note per causare overlap nel pass reale.

## Configurazione supportata

Il tipo condiviso `WalletWalletVisualConfig` espone:

- `logoText`
- `colorPreset`
- `barcodeFormat`
- `headerFields`
- `primaryFields`
- `secondaryFields`
- `backFields`

Ogni field list usa elementi `{ label, value }`.

## Regole di normalizzazione

La funzione `normalizeWalletWalletConfig()` applica sempre queste regole:

- `primaryFields` massimo 1
- `headerFields` massimo 2
- `secondaryFields` massimo 4
- `backFields` massimo 8
- trim di `label` e `value`
- rimozione dei campi vuoti
- extra `primaryFields` spostati in testa ai `secondaryFields`
- `auxiliaryFields` legacy migrati in `secondaryFields`
- `colorPreset` limitato a `dark | blue | green | red | purple | orange`, fallback `dark`
- se manca `logoText`, viene applicato un fallback valido

In sviluppo viene emesso un warning se la configurazione contiene piu di un primary field.

## Preset iniziale

Se la configurazione e vuota, il sistema inizializza:

- `logoText = "Angeli dei Navigli ODV"`
- `colorPreset = "dark"`
- `primaryFields = [{ label: "TESSERA", value: "{{roleLabel}} 2026" }]`
- `secondaryFields = [{ label: "NOME", value: "{{fullName}}" }, { label: "CODICE", value: "{{cardNumber}}" }, { label: "SCADENZA", value: "{{expiryDate}}" }]`
- `backFields = [{ label: "EMAIL", value: "{{email}}" }, { label: "ID", value: "{{id}}" }]`

Importante: `{{fullName}}` non deve essere usato come secondo primary field. Il nome completo rende meglio in `secondaryFields` o `backFields`.

## Placeholder

I `value` supportano:

- `{{fullName}}`
- `{{cardNumber}}`
- `{{roleLabel}}`
- `{{email}}`
- `{{id}}`
- `{{expiryDate}}`
- `{{associationName}}`

La preview e la generazione reale del pass condividono lo stesso builder, quindi interpretano i placeholder nello stesso modo.

## Preview

La preview interna simula il layout reale supportato dal provider:

- area alta con `logoText` e `headerFields`
- un solo `primaryField` in evidenza
- `secondaryFields` in griglia a due colonne
- barcode grande nella parte bassa
- `backFields` mostrati solo nel riquadro retro

Il layout finale puo differire leggermente da Apple Wallet, ma la preview non usa piu un layout creativo scollegato dal provider reale.
