import { Sidebar } from '@/components/Sidebar';
import { getOrganizzazioneSettings } from '@/lib/data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function GestionaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const organizzazioneSettings = await getOrganizzazioneSettings();

  return (
    <div className="shell">
      <Sidebar
        logoUrl={organizzazioneSettings?.logo_gestionale_url ?? null}
        nomeAssociazione={
          organizzazioneSettings?.nome_associazione ?? 'ANGELI DEI NAVIGLI'
        }
        sottotitoloAssociazione={
          organizzazioneSettings?.sottotitolo_associazione ??
          'Organizzazione di Volontariato'
        }
      />
      <main className="main">{children}</main>
    </div>
  );
}
