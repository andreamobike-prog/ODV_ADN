'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase-server';

type Result<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const ORGANIZZAZIONE_ID = '11111111-1111-1111-1111-111111111111';

export async function createVolontarioAction(payload: {
  nome: string;
  cognome: string;
  data_nascita: string;
  stato_nascita?: string;
  luogo_nascita: string;
  provincia_nascita: string;
  stato_estero_nascita?: string;
  codice_fiscale: string;
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  telefono?: string;
  email?: string;
  minorenne: boolean;
}): Promise<Result> {
  try {
    if (!payload.nome || !payload.cognome) {
      return { ok: false, error: 'Campi obbligatori mancanti.' };
    }

    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('volontari')
      .insert({
        organizzazione_id: ORGANIZZAZIONE_ID,
        nome: payload.nome,
        cognome: payload.cognome,
        data_nascita: payload.data_nascita || null,
        stato_nascita: payload.stato_nascita || null,
        luogo_nascita: payload.luogo_nascita || null,
        provincia_nascita: payload.provincia_nascita || null,
        stato_estero_nascita: payload.stato_estero_nascita || null,
        codice_fiscale: payload.codice_fiscale || null,
        indirizzo: payload.indirizzo || null,
        cap: payload.cap || null,
        comune: payload.comune || null,
        provincia: payload.provincia || null,
        telefono: payload.telefono || null,
        email: payload.email || null,
        minorenne: payload.minorenne,
        stato: 'sospeso',
        tipologia: 'occasionale',
        data_inizio: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath('/volontari');
    revalidatePath('/');
    revalidatePath(`/volontari/${data.id}`);

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Errore durante la creazione del volontario.',
    };
  }
}

export async function updateVolontarioAction(payload: {
  volontarioId: string;
  nome: string;
  cognome: string;
  data_nascita: string;
  stato_nascita?: string;
  luogo_nascita: string;
  provincia_nascita: string;
  stato_estero_nascita?: string;
  codice_fiscale: string;
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  telefono?: string;
  email?: string;
  stato: string;
  tipologia: 'continuativo' | 'occasionale';
  tutore_nome?: string;
  tutore_cognome?: string;
  tutore_codice_fiscale?: string;
  tutore_telefono?: string;
  tutore_email?: string;
  tutore_parentela?: string;
  tutore_indirizzo?: string;
  tutore_cap?: string;
  tutore_comune?: string;
  tutore_provincia?: string;
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: existing, error: existingError } = await supabase
      .from('volontari')
      .select('id,modifica_bloccata,data_inizio,stato')
      .eq('id', payload.volontarioId)
      .single();

    if (existingError) return { ok: false, error: existingError.message };
    if (existing?.modifica_bloccata) {
      return { ok: false, error: 'Questo volontario è bloccato e non può essere modificato.' };
    }

    const { data, error } = await supabase
      .from('volontari')
      .update({
        nome: payload.nome,
        cognome: payload.cognome,
        data_nascita: payload.data_nascita || null,
        stato_nascita: payload.stato_nascita || null,
        luogo_nascita: payload.luogo_nascita || null,
        provincia_nascita: payload.provincia_nascita || null,
        stato_estero_nascita: payload.stato_estero_nascita || null,
        codice_fiscale: payload.codice_fiscale || null,
        indirizzo: payload.indirizzo || null,
        cap: payload.cap || null,
        comune: payload.comune || null,
        provincia: payload.provincia || null,
        telefono: payload.telefono || null,
        email: payload.email || null,
        tutore_nome: payload.tutore_nome || null,
        tutore_cognome: payload.tutore_cognome || null,
        tutore_codice_fiscale: payload.tutore_codice_fiscale || null,
        tutore_telefono: payload.tutore_telefono || null,
        tutore_email: payload.tutore_email || null,
        tutore_parentela: payload.tutore_parentela || null,
        tutore_indirizzo: payload.tutore_indirizzo || null,
        tutore_cap: payload.tutore_cap || null,
        tutore_comune: payload.tutore_comune || null,
        tutore_provincia: payload.tutore_provincia || null,
        stato: payload.stato || existing?.stato || 'sospeso',
        tipologia: payload.tipologia,
        data_inizio: existing?.data_inizio ?? null,
      })
      .eq('id', payload.volontarioId)
      .select()
      .single();

    if (error) return { ok: false, error: error.message };

revalidatePath('/volontari');
revalidatePath('/volontari/archivio');
revalidatePath(`/volontari/${payload.volontarioId}`);

return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Errore durante l’aggiornamento del volontario.',
    };
  }
}

export async function attivaVolontarioAction(payload: {
  volontarioId: string;
  tipologia: 'continuativo' | 'occasionale';
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: existing, error: existingError } = await supabase
      .from('volontari')
      .select('id,tipologia')
      .eq('id', payload.volontarioId)
      .single();

    if (existingError) return { ok: false, error: existingError.message };

    const oggi = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('volontari')
      .update({
        stato: 'attivo',
        tipologia: payload.tipologia,
        data_inizio: oggi,
        modifica_bloccata: payload.tipologia === 'continuativo',
      })
      .eq('id', payload.volontarioId)
      .select()
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath('/volontari');
    revalidatePath(`/volontari/${payload.volontarioId}`);

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Errore durante l’attivazione del volontario.',
    };
  }
}

export async function cessaVolontarioAction(payload: {
  volontarioId: string;
  data_cessazione: string;
  note?: string;
}): Promise<Result> {
  try {
    if (!payload.data_cessazione) {
      return { ok: false, error: 'La data di cessazione è obbligatoria.' };
    }

    const supabase = await getSupabaseServerClient();

    const { data: volontario, error: loadError } = await supabase
      .from('volontari')
      .select('id,organizzazione_id')
      .eq('id', payload.volontarioId)
      .single();

    if (loadError) return { ok: false, error: loadError.message };

    const { error: updateError } = await supabase
      .from('volontari')
      .update({
        data_cessazione: payload.data_cessazione,
        archiviato: true,
        stato: 'sospeso',
      })
      .eq('id', payload.volontarioId);

    if (updateError) return { ok: false, error: updateError.message };

    const { data, error: archiveError } = await supabase
      .from('archivio_volontari')
      .insert({
        volontario_id: payload.volontarioId,
        organizzazione_id: volontario.organizzazione_id,
        data_cessazione: payload.data_cessazione,
        note: payload.note || null,
      })
      .select()
      .single();

    if (archiveError) return { ok: false, error: archiveError.message };

    revalidatePath('/volontari');
    revalidatePath(`/volontari/${payload.volontarioId}`);

    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Errore durante la cessazione del volontario.',
    };
  }
}

export async function ripristinaVolontarioAction(payload: {
  volontarioId: string;
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: volontario, error: loadError } = await supabase
      .from('volontari')
      .select('id, tipologia')
      .eq('id', payload.volontarioId)
      .single();

    if (loadError) return { ok: false, error: loadError.message };

    if (volontario.tipologia === 'continuativo') {
      return {
        ok: false,
        error: 'I volontari continuativi archiviati non possono essere ripristinati.',
      };
    }

    const { error: updateError } = await supabase
      .from('volontari')
      .update({
        data_cessazione: null,
        archiviato: false,
        stato: 'attivo',
      })
      .eq('id', payload.volontarioId);

    if (updateError) return { ok: false, error: updateError.message };

    const { error: deleteArchiveError } = await supabase
      .from('archivio_volontari')
      .delete()
      .eq('volontario_id', payload.volontarioId);

    if (deleteArchiveError) {
      return { ok: false, error: deleteArchiveError.message };
    }

    revalidatePath('/volontari');
    revalidatePath('/volontari/archivio');
    revalidatePath(`/volontari/${payload.volontarioId}`);

    return { ok: true, data: null };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Errore durante il ripristino del volontario.',
    };
  }
}

export async function convertiSocioInVolontarioAction(payload: {
  socioId: string;
  tipologia: 'continuativo' | 'occasionale';
}): Promise<Result> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: socio, error: socioError } = await supabase
      .from('soci')
      .select('*')
      .eq('id', payload.socioId)
      .single();

    if (socioError) return { ok: false, error: socioError.message };
    if (socio.modifica_bloccata) {
      return { ok: false, error: 'Questo socio è già bloccato e non può essere convertito.' };
    }

    const { data: volontario, error: volError } = await supabase
      .from('volontari')
      .insert({
        organizzazione_id: socio.organizzazione_id,
        socio_id: socio.id,
        nome: socio.nome,
        cognome: socio.cognome,
        stato: socio.stato,
        tipologia: payload.tipologia,
        data_inizio: new Date().toISOString().slice(0, 10),
        data_nascita: socio.data_nascita,
        luogo_nascita: socio.luogo_nascita,
        provincia_nascita: socio.provincia_nascita,
        codice_fiscale: socio.codice_fiscale,
        indirizzo: socio.indirizzo,
        cap: socio.cap,
        comune: socio.comune,
        provincia: socio.provincia,
        telefono: socio.telefono,
        email: socio.email,
        privacy_accettata: false,
        statuto_accettato: false,
        trattamento_dati_associazione: false,
        modifica_bloccata: payload.tipologia === 'continuativo',
      })
      .select()
      .single();

    if (volError) return { ok: false, error: volError.message };

    const { error: socioUpdateError } = await supabase
      .from('soci')
      .update({
        e_anche_volontario: true,
        modifica_bloccata: true,
      })
      .eq('id', socio.id);

    if (socioUpdateError) return { ok: false, error: socioUpdateError.message };

    revalidatePath('/soci');
    revalidatePath(`/soci/${socio.id}`);
    revalidatePath('/volontari');
    revalidatePath(`/volontari/${volontario.id}`);

    return { ok: true, data: volontario };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Errore nella conversione socio → volontario.',
    };
  }
}
