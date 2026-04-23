import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getRequiredEnv, isHttpUrl } from '@/lib/env';

export function getSupabaseClient(): SupabaseClient {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!isHttpUrl(url)) {
    throw new Error(`NEXT_PUBLIC_SUPABASE_URL non valida: ${url}`);
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
