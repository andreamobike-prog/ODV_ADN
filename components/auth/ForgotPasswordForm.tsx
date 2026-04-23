'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${baseUrl}/update-password`,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(
      "Se l'email e' presente in Supabase Auth, riceverai un link per impostare una nuova password."
    );
    setIsSubmitting(false);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <span className="auth-eyebrow">Recupero accesso</span>
        <h1>Password dimenticata?</h1>
        <p>Inserisci l&apos;email dell&apos;utente gia' creato in Supabase Auth.</p>
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

      {errorMessage ? <p className="auth-message auth-message-error">{errorMessage}</p> : null}
      {successMessage ? <p className="auth-message auth-message-success">{successMessage}</p> : null}

      <button className="button auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Invio in corso...' : 'Invia link di reset'}
      </button>

      <div className="auth-links">
        <Link href="/login">Torna al login</Link>
      </div>
    </form>
  );
}
