import { getVolontariCompleti } from '@/lib/data';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { VolontariPageClient } from '@/components/volontari/VolontariPageClient';

export default async function VolontariPage() {
  const volontari = await getVolontariCompleti();
  const supabase = await getSupabaseServerClient();

  const { data: organizzazione } = await supabase
    .from('organizzazione_settings')
    .select(
      'nome_associazione, indirizzo, cap, comune, provincia, codice_fiscale, runts_numero, logo_gestionale_url'
    )
    .eq('organizzazione_id', '11111111-1111-1111-1111-111111111111')
    .maybeSingle();

  return (
    <VolontariPageClient
      initialVolontari={volontari}
      organizzazione={organizzazione ?? null}
    />
  );
}