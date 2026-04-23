import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { DEFAULT_AUTHENTICATED_PATH, resolvePostLoginRedirect } from '@/lib/auth/redirect';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createSupabaseServerClient();
  const params = searchParams ? await searchParams : undefined;
  const nextParam = Array.isArray(params?.next) ? params?.next[0] : params?.next;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(resolvePostLoginRedirect(nextParam ?? DEFAULT_AUTHENTICATED_PATH));
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <LoginForm />
      </section>
    </main>
  );
}
