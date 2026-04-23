# Template Apple Wallet ODV

Questa cartella è una struttura di esempio per `APPLE_WALLET_TEMPLATE_PATH`.

Include asset minimi copiati dal logo pubblico del progetto:

- `icon.png`
- `logo.png`

Per produzione sostituiscili con asset grafici reali e aggiungi anche:

- `icon@2x.png`
- `icon@3x.png`
- `logo@2x.png`
- `logo@3x.png`

La route valida `pass.json`, `icon.png` e `logo.png`.
Se gli asset mancano, restituisce un errore di configurazione leggibile invece di crashare.

Senza certificati Apple la route genera un `.pkpass` non firmato. Il download funziona, ma Apple Wallet puo rifiutarne l'importazione.
