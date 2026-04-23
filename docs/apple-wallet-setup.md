# Apple Wallet setup

## Cosa è stato implementato

La scheda dettaglio di ogni socio e di ogni volontario include il pulsante `Aggiungi ad Apple Wallet`.

Il click chiama una route server-side che genera un file `.pkpass` personale.
Nessun certificato, chiave o segreto viene inviato al client.

La generazione supporta due modalità:

- firmata, con certificati Apple configurati, installabile su Apple Wallet
- non firmata, senza certificati Apple, utile per testare download, payload, QR e UI

Nota: Apple Wallet su iPhone accetta pass installabili solo se firmati con certificati Apple validi.

Regole applicate:

- soci: `type = "member"`
- volontari: `type = "volunteer"`
- `serialNumber = "<type>-<id>"`
- QR code: `qrValue = "<type>:<id>"`
- `id` è sempre l'ID reale del record Supabase
- `cardNumber` usa `codice_univoco` se presente, altrimenti un valore stabile derivato dall'ID

## File creati o modificati

- `lib/wallet/types.ts`
- `lib/wallet/getWalletSubject.ts`
- `lib/wallet/apple/config.ts`
- `lib/wallet/apple/createApplePass.ts`
- `app/api/wallet/apple/[type]/[id]/route.ts`
- `components/wallet/AppleWalletButton.tsx`
- `components/soci/SocioDetailClient.tsx`
- `components/volontari/VolontarioDetailClient.tsx`
- `.env.example`
- `docs/apple-wallet-setup.md`
- `wallet-templates/odv-card.pass/README.md`
- `wallet-templates/odv-card.pass/pass.json`
- `wallet-templates/odv-card.pass/icon.png`
- `wallet-templates/odv-card.pass/logo.png`

## Variabili ambiente

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

Senza certificati Apple puoi lasciare vuote:

- `APPLE_WALLET_PASS_TYPE_IDENTIFIER`
- `APPLE_WALLET_TEAM_IDENTIFIER`
- `APPLE_WALLET_CERT_PATH`
- `APPLE_WALLET_KEY_PATH`
- `APPLE_WALLET_WWDR_PATH`
- `APPLE_WALLET_KEY_PASSPHRASE`

In questo caso la route genera un `.pkpass` non firmato usando:

- `pass.local.odv.card` come Pass Type ID locale
- `LOCALTEAM` come Team ID locale
- `ODV` come organizzazione se `APPLE_WALLET_ORGANIZATION_NAME` è vuota
- `wallet-templates/odv-card.pass` se `APPLE_WALLET_TEMPLATE_PATH` è vuota

Per generare pass installabili su Apple Wallet devi configurare tutte le variabili.

Esempio locale:

```env
APPLE_WALLET_PASS_TYPE_IDENTIFIER=pass.it.example.odv.card
APPLE_WALLET_TEAM_IDENTIFIER=ABCDE12345
APPLE_WALLET_ORGANIZATION_NAME=ODV
APPLE_WALLET_CERT_PATH=/absolute/path/certs/pass-cert.pem
APPLE_WALLET_KEY_PATH=/absolute/path/certs/pass-key.pem
APPLE_WALLET_WWDR_PATH=/absolute/path/certs/wwdr.pem
APPLE_WALLET_KEY_PASSPHRASE=your-passphrase
APPLE_WALLET_TEMPLATE_PATH=/absolute/path/wallet-templates/odv-card.pass
```

Usa percorsi assoluti per certificati e template quando abiliti la modalità firmata, così la route funziona allo stesso modo in locale e in deploy.

## Pass Type ID e certificato Apple Wallet

1. Accedi ad Apple Developer.
2. Vai in `Certificates, Identifiers & Profiles`.
3. Crea un nuovo identifier di tipo `Pass Type IDs`.
4. Usa un identificatore stabile, per esempio `pass.it.nomeassociazione.card`.
5. Apri il Pass Type ID appena creato e genera il certificato Apple Wallet.
6. Carica una CSR generata dalla macchina o dal sistema dove custodisci le chiavi.
7. Scarica il certificato generato da Apple.

Il valore `APPLE_WALLET_PASS_TYPE_IDENTIFIER` deve coincidere con il Pass Type ID.
Il valore `APPLE_WALLET_TEAM_IDENTIFIER` è il Team ID del tuo account Apple Developer.

## Conversione certificati

Se hai un file `.p12`, puoi esportare certificato e chiave in PEM:

```bash
openssl pkcs12 -in pass-cert.p12 -clcerts -nokeys -out pass-cert.pem
openssl pkcs12 -in pass-cert.p12 -nocerts -out pass-key.pem
```

Se la chiave PEM è cifrata, inserisci la passphrase in `APPLE_WALLET_KEY_PASSPHRASE`.

Scarica anche il certificato Apple Worldwide Developer Relations e convertilo in PEM se necessario:

```bash
openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wwdr.pem
```

La variante WWDR deve essere quella richiesta dal certificato Apple Wallet scaricato.

## Template `.pass`

`APPLE_WALLET_TEMPLATE_PATH` può puntare a una cartella `.pass`.
Se non è valorizzata viene usato il template locale `wallet-templates/odv-card.pass`.
Nel repository è presente una struttura di esempio:

```txt
wallet-templates/odv-card.pass/
  README.md
  pass.json
  icon.png
  logo.png
```

Il template di esempio include asset minimi copiati dal logo pubblico del progetto.
Per produzione sostituiscili con asset grafici corretti:

```txt
icon.png
logo.png
```

Per compatibilità con dispositivi Retina è consigliato aggiungere anche:

```txt
icon@2x.png
icon@3x.png
logo@2x.png
logo@3x.png
```

Il codice valida `pass.json`, `icon.png` e `logo.png`.
Se mancano env, certificati, template o asset minimi, la route restituisce JSON con messaggio leggibile e il bottone mostra `Apple Wallet non ancora configurato`.

## Come testare in locale

1. Configura Supabase in `.env.local`.
2. Per test senza certificati Apple, lascia vuote le env certificate e usa il template locale.
3. Per test installabile su iPhone, configura tutte le variabili `APPLE_WALLET_*`.
4. Avvia il progetto:

```bash
npm run dev
```

5. Apri una scheda socio e clicca `Aggiungi ad Apple Wallet`.
6. Apri una scheda volontario e clicca `Aggiungi ad Apple Wallet`.

Endpoint diretti:

```txt
GET /api/wallet/apple/member/<id>
GET /api/wallet/apple/volunteer/<id>
```

Risposta corretta in entrambe le modalità:

- `Content-Type: application/vnd.apple.pkpass`
- `Content-Disposition: attachment; filename="card-<type>-<id>.pkpass"`

In modalità non firmata il download funziona, ma Apple Wallet può rifiutare l'importazione.

## Problemi comuni

- `Configurazione Apple Wallet incompleta`: una o più env non sono valorizzate, un path non esiste, o il template non contiene gli asset minimi.
- `Invalid certificate(s) loaded`: certificato, chiave, WWDR o passphrase non corrispondono.
- Il pass non si apre su iPhone: Pass Type ID, Team ID o firma non sono coerenti con il certificato.
- Il pass non firmato viene scaricato ma non installato: comportamento atteso senza certificati Apple.
- QR errato: verifica che l'endpoint usato sia `/member/<id>` per i soci e `/volunteer/<id>` per i volontari.
- Download JSON nel browser: usa il pulsante in UI; legge il JSON e mostra un errore pulito.
