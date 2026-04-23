'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth
      .getSession()
      .then(() => {
        setIsReady(true);
      })
      .catch(() => {
        setErrorMessage('Link di recupero non valido o scaduto.');
        setIsReady(true);
      });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 8) {
      setErrorMessage('La nuova password deve contenere almeno 8 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Le password non coincidono.');
      return;
    }

    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage('Password aggiornata. Verrai reindirizzato al login.');
    setTimeout(() => {
      router.replace('/login');
      router.refresh();
    }, 1200);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <span className="auth-eyebrow">Nuova password</span>
        <h1>Aggiorna password</h1>
        <p>Apri questa pagina dal link ricevuto via email e imposta una nuova password.</p>
      </div>

      <label className="auth-field">
        <span>Nuova password</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          disabled={!isReady || isSubmitting}
        />
      </label>

      <label className="auth-field">
        <span>Conferma password</span>
        <input
          className="input"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
          disabled={!isReady || isSubmitting}
        />
      </label>

      {errorMessage ? <p className="auth-message auth-message-error">{errorMessage}</p> : null}
      {successMessage ? <p className="auth-message auth-message-success">{successMessage}</p> : null}

      <button className="button auth-submit" type="submit" disabled={!isReady || isSubmitting}>
        {isSubmitting ? 'Aggiornamento...' : 'Salva nuova password'}
      </button>

      <div className="auth-links">
        <Link href="/login">Torna al login</Link>
      </div>
    </form>
  );
}
