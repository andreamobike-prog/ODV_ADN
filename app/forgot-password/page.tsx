import { redirect } from 'next/navigation';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
