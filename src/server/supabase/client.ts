import { createClient } from '@supabase/supabase-js';

import { getSupabaseServerEnv } from '@/server/supabase/env';

export function createSupabaseServerClient() {
  const env = getSupabaseServerEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
