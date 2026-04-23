import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRequiredEnv, isHttpUrl } from '@/lib/env';

export async function createSupabaseServerClient() {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!isHttpUrl(url)) {
    throw new Error(`NEXT_PUBLIC_SUPABASE_URL non valida: ${url}`);
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Nei Server Components la scrittura dei cookie puo' non essere disponibile.
        }
      },
    },
  });
}
