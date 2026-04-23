# Auth login con Supabase

## File creati o modificati

- `app/(gestionale)/dashboard/page.tsx`
- `app/(gestionale)/layout.tsx`
- `app/forgot-password/page.tsx`
- `app/login/page.tsx`
- `app/update-password/page.tsx`
- `components/Sidebar.tsx`
- `components/auth/ForgotPasswordForm.tsx`
- `components/auth/LoginForm.tsx`
- `components/auth/LogoutButton.tsx`
- `components/auth/UpdatePasswordForm.tsx`
- `.env.example`
- `docs/auth-login-supabase.md`
- `lib/supabase/client.ts`
- `lib/supabase/middleware.ts`
- `lib/supabase/server.ts`
- `lib/supabase-server.ts`
- `middleware.ts`
- `package.json`
- `package-lock.json`

## Come funziona

- Il login usa `supabase.auth.signInWithPassword({ email, password })`.
- La sessione viene mantenuta tramite cookie SSR usando `@supabase/ssr`.
- Il `middleware.ts` aggiorna la sessione ad ogni request e protegge le route del gestionale.
- Se un utente non autenticato apre una route protetta viene reindirizzato a `/login`.
- Se un utente autenticato apre `/login`, `/forgot-password` o `/update-password` viene reindirizzato a `/dashboard`.
- Il layout del gestionale esegue un secondo controllo server-side con `supabase.auth.getUser()` e blocca l'accesso con `redirect('/login')`.
- Non esiste signup pubblico.

## Route protette

- `/`
- `/dashboard`
- `/soci`
- `/volontari`
- `/eventi`
- `/gruppi`
- `/tessera`
- `/tessere`
- `/impostazioni`
- `/assistenza`
- `/tutorial`
- `/accessi`

Le sottoroute delle sezioni sopra sono protette automaticamente.

## Client Supabase

- `lib/supabase/client.ts`: browser client per login, logout, reset password e update password.
- `lib/supabase/server.ts`: server client App Router con `cookies()`.
- `lib/supabase/middleware.ts`: helper middleware per sincronizzare la sessione.

## Come creare utenti in Supabase Auth

1. Apri Supabase Dashboard.
2. Vai in `Authentication`.
3. Crea gli utenti manualmente nella sezione `Users`.
4. Comunica all'utente email e password iniziale, oppure chiedigli di usare `Password dimenticata?`.

## Utenti gia' creati e reset password

- Non c'e' registrazione pubblica.
- Se l'utente esiste gia' in Supabase Auth ma non conosce la password, deve usare la route `/forgot-password`.
- Il reset invia un'email verso `NEXT_PUBLIC_APP_BASE_URL/update-password`.
- Nella pagina `/update-password` l'utente imposta la nuova password con `supabase.auth.updateUser({ password })`.

## Variabili ambiente richieste

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

## Test locale

1. Configura `.env.local` con le variabili Supabase.
2. Verifica che in Supabase esista almeno un utente Auth con email e password.
3. Avvia il progetto con `npm run dev`.
4. Apri `/soci` o `/dashboard` da non autenticato e verifica il redirect a `/login`.
5. Esegui login con un utente valido e verifica l'accesso al gestionale.
6. Esegui logout dalla sidebar e verifica il ritorno a `/login`.
7. Prova una password errata e verifica il messaggio di errore.
8. Prova `/forgot-password` e verifica l'invio del link di reset.
