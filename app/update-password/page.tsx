import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';

export const dynamic = 'force-dynamic';

export default function UpdatePasswordPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <UpdatePasswordForm />
      </section>
    </main>
  );
}
