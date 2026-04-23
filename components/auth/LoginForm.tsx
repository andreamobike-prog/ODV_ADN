'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  DEFAULT_AUTHENTICATED_PATH,
  resolvePostLoginRedirect,
} from '@/lib/auth/redirect';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function toReadableAuthError(message?: string) {
  if (!message) {
    return 'Accesso non riuscito. Riprova.';
  }

  if (/invalid login credentials/i.test(message)) {
    return 'Email o password non corrette.';
  }

  if (/email not confirmed/i.test(message)) {
    return 'Email non confermata. Controlla la tua casella di posta.';
  }

  return message;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      const nextPath = resolvePostLoginRedirect(
        searchParams.get('next') || DEFAULT_AUTHENTICATED_PATH
      );
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Supabase signInWithPassword failed:', error.message);
        setErrorMessage(toReadableAuthError(error.message));
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      console.error('Unexpected login error:', error);
      setErrorMessage('Accesso non riuscito. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <span className="auth-eyebrow">Accesso gestionale</span>
        <h1>Accedi</h1>
        <p>Usa email e password del tuo utente gia' presente in Supabase Auth.</p>
      </div>

      <label className="auth-field">
        <span>Email</span>
        <input
          className="input"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {errorMessage ? <p className="auth-message auth-message-error">{errorMessage}</p> : null}

      <button className="button auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
      </button>

      <div className="auth-links">
        <Link href="/forgot-password">Password dimenticata?</Link>
      </div>
    </form>
  );
}
