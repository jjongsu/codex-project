import { z } from 'zod';

const supabaseServerEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export function isSupabaseServerConfigured() {
  return supabaseServerEnvSchema.safeParse(process.env).success;
}

export function getSupabaseServerEnv() {
  const parsed = supabaseServerEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in a root .env.local file.',
    );
  }

  return parsed.data;
}
