# ODV Gestionale - Next.js + Supabase

## Avvio

```bash
npm install
npm run dev
```

## Env

Copia `.env.example` in `.env.local` e inserisci:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Supabase

Esegui il file `sql/supabase_schema.sql` nel SQL Editor di Supabase.

## Note

- Se le variabili Supabase non sono presenti, l'app usa dati demo.
- La UI è pronta per essere estesa con CRUD reali, auth, storage, email, PDF e CSV.
