# Pass visual config

## Obiettivo

La sezione Impostazioni usa ora lo stesso modello supportato dal provider WalletWallet, con una preview che evita configurazioni note per causare overlap nel pass reale.

## Configurazione supportata

Il tipo condiviso `WalletWalletVisualConfig` espone:

- `logoText`
- `colorPreset`
- `barcodeFormat`
- `logoURL`
- `stripURL`
- `backgroundColor`
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
- `colorPreset` limitato a `dark | blue | green | red | purple | orange`, fallback `blue`
- trim anche di `logoURL`, `stripURL` e `backgroundColor`
- se manca `logoText`, viene applicato un fallback valido

In sviluppo viene emesso un warning se la configurazione contiene piu di un primary field.

## Preset iniziale

Se la configurazione e vuota, il sistema inizializza:

- `logoText = "ANGELI DEI NAVIGLI"`
- `colorPreset = "blue"`
- `primaryFields = []`
- `secondaryFields = [{ label: "SOCIO", value: "{{fullNameUpper}}" }, { label: "COD. SOCIO", value: "{{cardNumber}}" }, { label: "SCADENZA", value: "{{expiryDate}}" }]`
- `backFields = [{ label: "Nome", value: "{{fullName}}" }, { label: "Tipo", value: "{{roleLabel}}" }, { label: "Email", value: "{{email}}" }, { label: "ID", value: "{{id}}" }]`

Importante: `{{fullName}}` non deve essere usato come primary field se vuoi il layout con strip panoramica e tre colonne frontali. Il nome completo rende meglio in `secondaryFields` o `backFields`.

## Placeholder

I `value` supportano:

- `{{fullName}}`
- `{{fullNameUpper}}`
- `{{cardNumber}}`
- `{{roleLabel}}`
- `{{email}}`
- `{{id}}`
- `{{expiryDate}}`
- `{{associationName}}`

La preview e la generazione reale del pass condividono lo stesso builder, quindi interpretano i placeholder nello stesso modo.

## Preview

La preview interna simula il layout reale supportato dal provider:

- area alta con logo a sinistra e `logoText`
- strip panoramica centrale tramite `stripURL`
- `secondaryFields` in tre colonne
- barcode grande nella parte bassa
- URL asset realmente inviati al provider
- `backFields` mostrati solo nel riquadro retro

Il layout finale puo differire leggermente da Apple Wallet, ma la preview non usa piu un layout creativo scollegato dal provider reale.
