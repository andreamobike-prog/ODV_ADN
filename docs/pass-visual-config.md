# Pass visual config

## Obiettivo

La configurazione WalletWallet e stata semplificata in modo definitivo: l'utente gestisce solo titolo card, colore esadecimale, link logo e link immagine centrale.

## Configurazione supportata

Il JSON salvato in `walletwallet_visual_config` contiene solo:

```json
{
  "logoText": "Angeli dei Navigli ODV",
  "backgroundColor": "#1F2947",
  "logoURL": "https://example.org/logo.png",
  "stripURL": "https://example.org/strip.png"
}
```

Il sistema mantiene compatibilita in lettura con dati legacy, ma:

- non mostra piu editor per `primaryFields`, `secondaryFields`, `headerFields`, `auxiliaryFields`, `backFields`
- non usa piu quei campi per comporre il pass finale

## Campi generati automaticamente

Il fronte del pass usa sempre:

- `SOCIO` -> nome del soggetto
- `CODICE` -> numero tessera
- `SCADENZA` -> data scadenza

Il QR viene generato automaticamente e mostrato sotto questi dati.

Il retro del payload usa sempre:

- `NOME`
- `EMAIL`
- `ID`

## Validazione

- `logoText` obbligatorio
- `backgroundColor` obbligatorio nel formato `#RRGGBB`
- `logoURL` opzionale ma, se presente, deve essere `https://`
- `stripURL` opzionale ma, se presente, deve essere `https://`

## Preview

La preview mostra solo il fronte:

- sfondo uguale al colore esadecimale scelto
- logo a sinistra se presente
- titolo card
- immagine centrale se presente
- tre blocchi dati fissi sotto immagine
- QR grande in basso

Non mostra piu:

- retro
- URL tecnici
- descrizioni tecniche
- campi configurabili legacy
